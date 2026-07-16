create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'inactive' check (status in ('inactive', 'trialing', 'active', 'past_due', 'canceled')),
  provider text,
  provider_customer_id text,
  provider_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_plans enable row level security;

drop policy if exists "Users can view their own plan" on public.user_plans;
create policy "Users can view their own plan"
  on public.user_plans
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Los usuarios solo pueden leer su plan. La futura integración de pagos lo
-- actualizará desde el servidor con service_role, nunca desde el navegador.
revoke insert, update, delete on public.user_plans from anon, authenticated;
grant select on public.user_plans to authenticated;

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

create or replace function public.set_user_plans_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists set_user_plans_updated_at on public.user_plans;
create trigger set_user_plans_updated_at
before update on public.user_plans
for each row execute function public.set_user_plans_updated_at();

drop function if exists public.consume_ai_quota(text);

create function public.consume_ai_quota(p_kind text)
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
