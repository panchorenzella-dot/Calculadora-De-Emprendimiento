-- Planes mensuales Basic, Pro y Premium, con cuotas aplicadas en servidor.

alter table public.user_plans
  drop constraint if exists user_plans_plan_check;

alter table public.user_plans
  add constraint user_plans_plan_check
  check (plan in ('free', 'basic', 'pro', 'premium'));

alter table public.ai_provider_events
  drop constraint if exists ai_provider_events_plan_check;

alter table public.ai_provider_events
  add constraint ai_provider_events_plan_check
  check (plan in ('free', 'basic', 'pro', 'premium'));

create or replace function public.get_effective_plan(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select user_plan.plan
    from public.user_plans user_plan
    where user_plan.user_id = p_user_id
      and user_plan.plan in ('basic', 'pro', 'premium')
      and (
        (user_plan.status in ('active', 'trialing') and user_plan.current_period_end is null)
        or (
          user_plan.status in ('active', 'trialing', 'past_due')
          and user_plan.current_period_end is not null
          and user_plan.current_period_end + interval '2 days' > pg_catalog.now()
        )
      )
    limit 1
  ), 'free');
$$;

revoke all on function public.get_effective_plan(uuid) from public, anon, authenticated;

-- Se conserva el nombre por compatibilidad con funciones y aplicaciones previas.
create or replace function public.has_pro_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.get_effective_plan(p_user_id) in ('basic', 'pro', 'premium');
$$;

revoke all on function public.has_pro_access(uuid) from public, anon, authenticated;

drop function if exists public.consume_ai_quota(text);

create function public.consume_ai_quota(p_kind text)
returns table (
  allowed boolean,
  used integer,
  quota_limit integer,
  resets_at timestamptz,
  plan text,
  usage_event_id bigint,
  denial_reason text,
  burst_limit integer,
  burst_retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan text;
  v_now timestamptz := pg_catalog.now();
  v_now_local timestamp := v_now at time zone 'America/Argentina/Buenos_Aires';
  v_period_start_local timestamp;
  v_period_end_local timestamp;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_limit integer;
  v_used integer;
  v_usage_event_id bigint;
  v_burst_limit integer;
  v_burst_used integer;
  v_burst_oldest_at timestamptz;
  v_burst_retry_after_seconds integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_kind is null or p_kind not in ('analysis', 'chat') then
    raise exception 'Invalid usage kind';
  end if;

  v_plan := public.get_effective_plan(v_user_id);

  if v_plan = 'premium' then
    v_limit := null;
    v_burst_limit := 20;
    v_period_start_local := pg_catalog.date_trunc('month', v_now_local);
    v_period_end_local := v_period_start_local + interval '1 month';
  elsif v_plan = 'pro' then
    v_limit := case p_kind when 'analysis' then 50 else 500 end;
    v_burst_limit := 10;
    v_period_start_local := pg_catalog.date_trunc('month', v_now_local);
    v_period_end_local := v_period_start_local + interval '1 month';
  elsif v_plan = 'basic' then
    v_limit := case p_kind when 'analysis' then 5 else 50 end;
    v_burst_limit := 5;
    v_period_start_local := pg_catalog.date_trunc('month', v_now_local);
    v_period_end_local := v_period_start_local + interval '1 month';
  elsif p_kind = 'analysis' then
    v_limit := 1;
    v_burst_limit := 3;
    v_period_start_local := pg_catalog.date_trunc('week', v_now_local);
    v_period_end_local := v_period_start_local + interval '1 week';
  else
    v_limit := 5;
    v_burst_limit := 3;
    v_period_start_local := pg_catalog.date_trunc('day', v_now_local);
    v_period_end_local := v_period_start_local + interval '1 day';
  end if;

  v_period_start := v_period_start_local at time zone 'America/Argentina/Buenos_Aires';
  v_period_end := v_period_end_local at time zone 'America/Argentina/Buenos_Aires';

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':ai-quota', 0)
  );

  select pg_catalog.count(*)::integer
    into v_used
    from public.ai_usage_events event
   where event.user_id = v_user_id
     and event.usage_kind = p_kind
     and event.created_at >= v_period_start
     and event.created_at < v_period_end;

  if v_limit is not null and v_used >= v_limit then
    return query select false, v_used, v_limit, v_period_end, v_plan, null::bigint,
      'quota'::text, v_burst_limit, null::integer;
    return;
  end if;

  select pg_catalog.count(*)::integer, pg_catalog.min(event.created_at)
    into v_burst_used, v_burst_oldest_at
    from public.ai_usage_events event
   where event.user_id = v_user_id
     and event.usage_kind in ('analysis', 'chat')
     and event.created_at > v_now - interval '60 seconds';

  if v_burst_used >= v_burst_limit then
    v_burst_retry_after_seconds := pg_catalog.ceil(
      extract(epoch from (v_burst_oldest_at + interval '60 seconds' - v_now))
    )::integer;
    if v_burst_retry_after_seconds < 1 then
      v_burst_retry_after_seconds := 1;
    end if;

    return query select false, v_used, v_limit, v_period_end, v_plan, null::bigint,
      'burst'::text, v_burst_limit, v_burst_retry_after_seconds;
    return;
  end if;

  insert into public.ai_usage_events (user_id, usage_kind)
  values (v_user_id, p_kind)
  returning id into v_usage_event_id;

  return query select true, v_used + 1, v_limit, v_period_end, v_plan,
    v_usage_event_id, null::text, v_burst_limit, null::integer;
end;
$$;

revoke all on function public.consume_ai_quota(text) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(text) to authenticated;

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
  v_plan text;
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

  v_plan := public.get_effective_plan(v_user_id);
  v_limit := case when v_plan in ('free', 'basic') then 2 else null end;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':scenario', 0)
  );

  select pg_catalog.count(*)::integer
    into v_used
    from public.saved_scenarios scenario
   where scenario.user_id = v_user_id;

  if v_limit is not null and v_used >= v_limit then
    return query select false, null::uuid, v_used, v_limit, null::timestamptz, v_plan;
    return;
  end if;

  insert into public.saved_scenarios (user_id, calculator_type, title, inputs, results)
  values (v_user_id, p_calculator_type, p_title, p_inputs, p_results)
  returning id into v_scenario_id;

  insert into public.ai_usage_events (user_id, usage_kind, scenario_id)
  values (v_user_id, 'scenario', v_scenario_id);

  return query select true, v_scenario_id, v_used + 1, v_limit, null::timestamptz, v_plan;
end;
$$;

revoke all on function public.save_scenario_with_quota(text, text, jsonb, jsonb) from public, anon, authenticated;
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
  v_plan text;
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

  v_plan := public.get_effective_plan(v_user_id);

  foreach v_kind in array array['analysis', 'chat', 'scenario'] loop
    if v_kind = 'scenario' then
      v_limit := case when v_plan in ('free', 'basic') then 2 else null end;
      v_period_start := null;
      v_period_end := null;
      select pg_catalog.count(*)::integer
        into v_used
        from public.saved_scenarios scenario
       where scenario.user_id = v_user_id;
    else
      if v_plan = 'premium' then
        v_limit := null;
        v_period_start_local := pg_catalog.date_trunc('month', v_now_local);
        v_period_end_local := v_period_start_local + interval '1 month';
      elsif v_plan = 'pro' then
        v_limit := case v_kind when 'analysis' then 50 else 500 end;
        v_period_start_local := pg_catalog.date_trunc('month', v_now_local);
        v_period_end_local := v_period_start_local + interval '1 month';
      elsif v_plan = 'basic' then
        v_limit := case v_kind when 'analysis' then 5 else 50 end;
        v_period_start_local := pg_catalog.date_trunc('month', v_now_local);
        v_period_end_local := v_period_start_local + interval '1 month';
      elsif v_kind = 'analysis' then
        v_limit := 1;
        v_period_start_local := pg_catalog.date_trunc('week', v_now_local);
        v_period_end_local := v_period_start_local + interval '1 week';
      else
        v_limit := 5;
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
    end if;

    resource := v_kind;
    used := v_used;
    quota_limit := v_limit;
    resets_at := v_period_end;
    plan := v_plan;
    return next;
  end loop;
end;
$$;

revoke all on function public.get_my_usage_summary() from public, anon, authenticated;
grant execute on function public.get_my_usage_summary() to authenticated;
