-- Mantiene Pro durante dos dias despues del vencimiento del periodo pago.
-- Los planes manuales sin fecha de fin siguen siendo permanentes.

create or replace function public.has_pro_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_plans user_plan
    where user_plan.user_id = p_user_id
      and user_plan.plan = 'pro'
      and (
        (user_plan.status in ('active', 'trialing') and user_plan.current_period_end is null)
        or (
          user_plan.status in ('active', 'trialing', 'past_due')
          and user_plan.current_period_end is not null
          and user_plan.current_period_end + interval '2 days' > pg_catalog.now()
        )
      )
  );
$$;

revoke all on function public.has_pro_access(uuid) from public, anon, authenticated;

create or replace function public.consume_ai_quota(p_kind text)
returns table (
  allowed boolean,
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
  v_limit integer;
  v_used integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if public.has_pro_access(v_user_id) then
    v_plan := 'pro';
  end if;

  if v_plan = 'pro' then
    if p_kind = 'analysis' then
      v_limit := 30;
    elsif p_kind = 'chat' then
      v_limit := 300;
    else
      raise exception 'Invalid usage kind';
    end if;
    v_period_start_local := pg_catalog.date_trunc('month', v_now_local);
    v_period_end_local := v_period_start_local + interval '1 month';
  elsif p_kind = 'analysis' then
    v_limit := 1;
    v_period_start_local := pg_catalog.date_trunc('week', v_now_local);
    v_period_end_local := v_period_start_local + interval '1 week';
  elsif p_kind = 'chat' then
    v_limit := 5;
    v_period_start_local := pg_catalog.date_trunc('day', v_now_local);
    v_period_end_local := v_period_start_local + interval '1 day';
  else
    raise exception 'Invalid usage kind';
  end if;

  v_period_start := v_period_start_local at time zone 'America/Argentina/Buenos_Aires';
  v_period_end := v_period_end_local at time zone 'America/Argentina/Buenos_Aires';

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':' || p_kind, 0)
  );

  select pg_catalog.count(*)::integer
    into v_used
    from public.ai_usage_events
   where user_id = v_user_id
     and usage_kind = p_kind
     and created_at >= v_period_start
     and created_at < v_period_end;

  if v_used >= v_limit then
    return query select false, v_used, v_limit, v_period_end, v_plan;
    return;
  end if;

  insert into public.ai_usage_events (user_id, usage_kind)
  values (v_user_id, p_kind);

  return query select true, v_used + 1, v_limit, v_period_end, v_plan;
end;
$$;

revoke all on function public.consume_ai_quota(text) from public, anon;
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

  if public.has_pro_access(v_user_id) then
    v_plan := 'pro';
  end if;

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

  if public.has_pro_access(v_user_id) then
    v_plan := 'pro';
  end if;

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
