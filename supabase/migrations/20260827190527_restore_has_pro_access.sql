-- Restore the private helper required by quota and scenario functions.
-- Keeping it non-executable by API roles prevents clients from probing plans.
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
