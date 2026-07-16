-- Ejecutar unicamente desde Supabase > SQL Editor.
-- Reemplaza TU_EMAIL@EJEMPLO.COM por el email exacto de la cuenta.
-- Esta configuracion activa Pro durante 1 mes desde el momento de ejecucion.
-- Para otro periodo, cambia interval '1 month' por '3 months' o '1 year'.

with configuracion as (
  select
    lower('TU_EMAIL@EJEMPLO.COM')::text as email,
    interval '1 month' as duracion
),
usuario_objetivo as (
  select users.id, configuracion.duracion
  from auth.users as users
  cross join configuracion
  where lower(users.email) = configuracion.email
  limit 1
)
insert into public.user_plans (
  user_id,
  plan,
  status,
  provider,
  current_period_start,
  current_period_end,
  cancel_at_period_end
)
select
  id,
  'pro',
  'active',
  'manual',
  now(),
  now() + duracion,
  false
from usuario_objetivo
on conflict (user_id) do update set
  plan = 'pro',
  status = 'active',
  provider = 'manual',
  current_period_start = excluded.current_period_start,
  current_period_end = excluded.current_period_end,
  cancel_at_period_end = false
returning
  user_id,
  plan,
  status,
  current_period_start,
  current_period_end;
