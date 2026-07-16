alter table public.ai_usage_events
  drop constraint if exists ai_usage_events_usage_kind_check;

alter table public.ai_usage_events
  add constraint ai_usage_events_usage_kind_check
  check (usage_kind in ('analysis', 'chat', 'scenario'));

alter table public.ai_usage_events
  add column if not exists scenario_id uuid references public.saved_scenarios(id) on delete set null;

create unique index if not exists ai_usage_events_scenario_unique_idx
  on public.ai_usage_events (scenario_id)
  where scenario_id is not null;

-- Conserva el consumo histórico de los escenarios ya guardados. De esta forma,
-- borrarlos no permite recuperar artificialmente el cupo del mismo día.
insert into public.ai_usage_events (user_id, usage_kind, created_at, scenario_id)
select scenario.user_id, 'scenario', scenario.created_at, scenario.id
from public.saved_scenarios scenario
on conflict (scenario_id) where scenario_id is not null do nothing;

drop policy if exists "Users can create their own scenarios" on public.saved_scenarios;
revoke insert on public.saved_scenarios from anon, authenticated;

create or replace function public.save_scenario_with_quota(
  p_calculator_type text,
  p_title text,
  p_inputs jsonb,
  p_results jsonb
)
returns table (
  allowed boolean,
  scenario_id uuid,
  used integer,
  quota_limit integer,
  resets_at timestamptz,
  plan text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan text := 'free';
  v_now_local timestamp := pg_catalog.now() at time zone 'America/Argentina/Buenos_Aires';
  v_period_start_local timestamp;
  v_period_end_local timestamp;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_used integer := 0;
  v_limit integer;
  v_scenario_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_calculator_type is null or pg_catalog.length(pg_catalog.btrim(p_calculator_type)) = 0 then
    raise exception 'Calculator type is required';
  end if;

  select case when exists (
    select 1
    from public.user_plans user_plan
    where user_plan.user_id = v_user_id
      and user_plan.plan = 'pro'
      and user_plan.status in ('active', 'trialing')
      and (user_plan.current_period_end is null or user_plan.current_period_end > pg_catalog.now())
  ) then 'pro' else 'free' end
  into v_plan;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':scenario', 0)
  );

  if v_plan = 'free' then
    v_limit := 3;
    v_period_start_local := pg_catalog.date_trunc('day', v_now_local);
    v_period_end_local := v_period_start_local + interval '1 day';
    v_period_start := v_period_start_local at time zone 'America/Argentina/Buenos_Aires';
    v_period_end := v_period_end_local at time zone 'America/Argentina/Buenos_Aires';

    select pg_catalog.count(*)::integer
      into v_used
      from public.ai_usage_events event
     where event.user_id = v_user_id
       and event.usage_kind = 'scenario'
       and event.created_at >= v_period_start
       and event.created_at < v_period_end;

    if v_used >= v_limit then
      return query select false, null::uuid, v_used, v_limit, v_period_end, v_plan;
      return;
    end if;
  end if;

  insert into public.saved_scenarios (user_id, calculator_type, title, inputs, results)
  values (v_user_id, p_calculator_type, p_title, p_inputs, p_results)
  returning id into v_scenario_id;

  insert into public.ai_usage_events (user_id, usage_kind, scenario_id)
  values (v_user_id, 'scenario', v_scenario_id);

  return query select true, v_scenario_id, v_used + 1, v_limit, v_period_end, v_plan;
end;
$$;

revoke all on function public.save_scenario_with_quota(text, text, jsonb, jsonb) from public, anon;
grant execute on function public.save_scenario_with_quota(text, text, jsonb, jsonb) to authenticated;

create or replace function public.get_my_usage_summary()
returns table (
  resource text,
  used integer,
  quota_limit integer,
  resets_at timestamptz,
  plan text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan text := 'free';
  v_kind text;
  v_now_local timestamp := pg_catalog.now() at time zone 'America/Argentina/Buenos_Aires';
  v_period_start_local timestamp;
  v_period_end_local timestamp;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_limit integer;
  v_used integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select case when exists (
    select 1
    from public.user_plans user_plan
    where user_plan.user_id = v_user_id
      and user_plan.plan = 'pro'
      and user_plan.status in ('active', 'trialing')
      and (user_plan.current_period_end is null or user_plan.current_period_end > pg_catalog.now())
  ) then 'pro' else 'free' end
  into v_plan;

  foreach v_kind in array array['analysis', 'chat', 'scenario'] loop
    if v_plan = 'pro' then
      v_limit := case v_kind when 'analysis' then 30 when 'chat' then 300 else null end;
      v_period_start_local := pg_catalog.date_trunc('month', v_now_local);
      v_period_end_local := v_period_start_local + interval '1 month';
    elsif v_kind = 'analysis' then
      v_limit := 1;
      v_period_start_local := pg_catalog.date_trunc('week', v_now_local);
      v_period_end_local := v_period_start_local + interval '1 week';
    else
      v_limit := case v_kind when 'chat' then 5 else 3 end;
      v_period_start_local := pg_catalog.date_trunc('day', v_now_local);
      v_period_end_local := v_period_start_local + interval '1 day';
    end if;

    v_period_start := v_period_start_local at time zone 'America/Argentina/Buenos_Aires';
    v_period_end := v_period_end_local at time zone 'America/Argentina/Buenos_Aires';

    select pg_catalog.count(*)::integer
      into v_used
      from public.ai_usage_events event
     where event.user_id = v_user_id
       and event.usage_kind = v_kind
       and event.created_at >= v_period_start
       and event.created_at < v_period_end;

    resource := v_kind;
    used := v_used;
    quota_limit := v_limit;
    resets_at := v_period_end;
    plan := v_plan;
    return next;
  end loop;
end;
$$;

revoke all on function public.get_my_usage_summary() from public, anon;
grant execute on function public.get_my_usage_summary() to authenticated;
