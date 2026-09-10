# Política de caché

La aplicación usa la caché nativa de Next.js y Vercel. No necesita Redis para
contenido que ya vive en el repositorio.

## Contenido público

- Las calculadoras, el catálogo y las guías se generan como HTML estático.
- `revalidate = false` deja explícito que estos recursos cambian con cada
  deployment, no mediante regeneraciones periódicas. Esto evita invocaciones y
  escrituras de ISR sin beneficio.
- `robots.txt`, `sitemap.xml` y la imagen Open Graph permiten una hora de caché
  en el navegador y un día en la CDN, con una semana de
  `stale-while-revalidate`.
- Los archivos de `/_next/static` mantienen la política inmutable y con hash que
  Next.js genera automáticamente; no se sobrescribe desde la aplicación.

## Contenido que nunca se comparte

`next.config.ts` aplica `private, no-store` y `Vercel-CDN-Cache-Control:
no-store` a:

- Todas las rutas `/api/*`, incluidas IA, cálculos y PayPal.
- `/perfil` y sus subrutas.
- `/restablecer-contrasena`.

Esta frontera es intencional: una respuesta que depende de identidad, pagos,
credenciales o datos enviados por una persona no se debe almacenar en una CDN.
Si una futura API es realmente pública, idempotente y no personalizada, debe
declararse como una excepción específica y tener una prueba de aislamiento.

## Verificación después de desplegar

Comprobar una ruta pública y dos privadas:

```bash
curl -sSI https://www.calculadoraemprendedora.com/robots.txt
curl -sSI https://www.calculadoraemprendedora.com/perfil
curl -sSI -X POST https://www.calculadoraemprendedora.com/api/calc
```

La primera debería mostrar una directiva pública y, después de calentarse, un
`x-vercel-cache` de caché. Las privadas deben mostrar `Cache-Control: private,
no-store` y no deben producir un HIT compartido. Para páginas como
`/calculadoras`, el reporte de `next build` debe seguir marcándolas como
`Static`/`SSG`.

Referencias oficiales:

- https://vercel.com/docs/caching
- https://nextjs.org/docs/app/guides/caching
