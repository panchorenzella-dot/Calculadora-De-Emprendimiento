-- Asocia cada consumo de IA con el evento reservado para que el servidor pueda
-- devolverlo si OpenAI falla antes de entregar una respuesta al usuario.

drop function if exists public.consume_ai_quota(text);

create function public.consume_ai_quota(p_kind text)
returns table (
  allowed boolean,
  used integer,
  quota_limit integer,
  resets_at timestamptz,
  plan text,
  usage_event_id bigint
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
  v_usage_event_id bigint;
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
    from public.ai_usage_events event
   where event.user_id = v_user_id
     and event.usage_kind = p_kind
     and event.created_at >= v_period_start
     and event.created_at < v_period_end;

  if v_used >= v_limit then
    return query select false, v_used, v_limit, v_period_end, v_plan, null::bigint;
    return;
  end if;

  insert into public.ai_usage_events (user_id, usage_kind)
  values (v_user_id, p_kind)
  returning id into v_usage_event_id;

  return query select true, v_used + 1, v_limit, v_period_end, v_plan, v_usage_event_id;
end;
$$;

revoke all on function public.consume_ai_quota(text) from public, anon;
grant execute on function public.consume_ai_quota(text) to authenticated;
