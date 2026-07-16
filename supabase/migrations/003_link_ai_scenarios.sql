alter table public.ai_conversations
  add column if not exists scenario_id uuid references public.saved_scenarios(id) on delete set null;

create index if not exists ai_conversations_scenario_idx
  on public.ai_conversations (scenario_id);
