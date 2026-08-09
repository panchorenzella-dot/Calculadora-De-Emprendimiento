# Configuración de Supabase

1. Copiar `.env.example` como `.env.local` y completar las dos variables con los valores de **Supabase → Project Settings → API**.
2. Ejecutar `supabase/migrations/001_saved_scenarios.sql` desde **Supabase → SQL Editor**.
3. En **Authentication → URL Configuration**, agregar `http://localhost:3000/**`, `https://www.calculadoraemprendedora.com/**` y cualquier otro dominio de producción a las URLs permitidas.
4. En **Authentication → Providers → Email**, mantener activada la opción **Confirm email**. De esta manera, una cuenta creada con email solo se activa después de abrir el enlace de verificación.
5. Habilitar Google en **Authentication → Providers** con su Client ID y Client Secret. Google ya entrega la dirección de email verificada.
6. Agregar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en las variables de entorno de Vercel y volver a desplegar.

La tabla `saved_scenarios` tiene Row Level Security. Cada usuario solo puede consultar y modificar sus propios escenarios.
