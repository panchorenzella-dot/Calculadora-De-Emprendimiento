create table if not exists public.saved_scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calculator_type text not null,
  title text,
  inputs jsonb not null,
  results jsonb not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_scenarios_user_created_idx
  on public.saved_scenarios (user_id, created_at desc);

alter table public.saved_scenarios enable row level security;

create policy "Users can read their own scenarios"
  on public.saved_scenarios for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create their own scenarios"
  on public.saved_scenarios for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own scenarios"
  on public.saved_scenarios for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own scenarios"
  on public.saved_scenarios for delete
  to authenticated
  using (user_id = auth.uid());

create or replace function public.set_saved_scenarios_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists saved_scenarios_set_updated_at on public.saved_scenarios;
create trigger saved_scenarios_set_updated_at
before update on public.saved_scenarios
for each row execute function public.set_saved_scenarios_updated_at();
