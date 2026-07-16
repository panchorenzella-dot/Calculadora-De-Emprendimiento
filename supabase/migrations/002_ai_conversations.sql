create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calculator_type text not null,
  calculator_name text not null,
  calculator_path text not null,
  title text not null,
  context jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_conversations_user_updated_idx on public.ai_conversations (user_id, updated_at desc);
create index if not exists ai_messages_conversation_created_idx on public.ai_messages (conversation_id, created_at);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

create policy "Users manage their own AI conversations" on public.ai_conversations for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users read their own AI messages" on public.ai_messages for select to authenticated using (user_id = auth.uid());
create policy "Users create their own AI messages" on public.ai_messages for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "Users delete their own AI messages" on public.ai_messages for delete to authenticated using (user_id = auth.uid());

create or replace function public.touch_ai_conversation()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  update public.ai_conversations set updated_at = pg_catalog.now() where id = new.conversation_id and user_id = new.user_id;
  return new;
end;
$$;

drop trigger if exists ai_message_touch_conversation on public.ai_messages;
create trigger ai_message_touch_conversation after insert on public.ai_messages for each row execute function public.touch_ai_conversation();
