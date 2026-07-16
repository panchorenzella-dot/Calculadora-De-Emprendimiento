create table if not exists public.consumer_requests (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  request_type text not null check (request_type in ('withdrawal', 'cancellation')),
  full_name text not null,
  email text not null,
  reference text,
  details text,
  request_ip_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'verifying', 'completed', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.consumer_requests enable row level security;

revoke all on public.consumer_requests from anon, authenticated;

create index if not exists consumer_requests_status_created_idx
  on public.consumer_requests (status, created_at desc);

create index if not exists consumer_requests_ip_created_idx
  on public.consumer_requests (request_ip_hash, created_at desc);

comment on table public.consumer_requests is
  'Solicitudes públicas de arrepentimiento y baja. Solo accesibles desde el servidor con la clave privada.';
