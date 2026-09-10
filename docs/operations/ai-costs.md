# Costos y límites de la IA

La ruta `/api/ai` combina tres defensas: cuota por plan, límite corto por
usuario y telemetría privada de cada llamada. Una consulta rechazada por cuota
o por ráfaga no llega a OpenAI. Si el proveedor falla antes de entregar una
respuesta útil, la reserva de cuota se devuelve y el intento queda registrado
sin conservar el prompt ni la respuesta.

## Límites vigentes

| Plan | Análisis | Chat | Ráfaga máxima |
| --- | --- | --- | --- |
| Gratuito | 1 por semana | 5 por día | 3 llamadas cada 60 segundos |
| Pro | 30 por mes | 300 por mes | 10 llamadas cada 60 segundos |

El servidor aplica estos límites de forma atómica en Postgres. Esto evita que
dos Functions de Vercel paralelas consuman más cupo del permitido. Las
respuestas por ráfaga incluyen HTTP `429` y `Retry-After`; las de cuota indican
la fecha de renovación.

## Modelo y costo máximo teórico

El modelo se resuelve en este orden:

1. `OPENAI_FREE_MODEL` u `OPENAI_PRO_MODEL`, según el plan.
2. `OPENAI_MODEL`, como configuración compartida.
3. `gpt-5.4-mini`, como fallback conocido.

Con los topes actuales de salida (4.500 tokens por análisis y 2.200 por mensaje)
y el precio de salida de GPT-5.4 mini de USD 4,50 por millón de tokens, el máximo
teórico mensual solo de salida es aproximadamente USD 1,64 por usuario gratuito
extremadamente activo y USD 3,58 por usuario Pro. A eso se suma la entrada; por
eso el costo real se controla con tokens medidos y no con esta estimación.

Los precios usados por el código fueron revisados el 9 de septiembre de 2026:

- GPT-5 mini: USD 0,25/M entrada, USD 0,025/M entrada cacheada y USD 2/M salida.
- GPT-5.4 mini: USD 0,75/M entrada, USD 0,075/M entrada cacheada y USD 4,50/M salida.

Si OpenAI devuelve un modelo sin precio registrado, se guardan sus tokens pero
`estimated_cost_usd` queda en `null`. Eso evita mostrar un costo inventado y
hace visible que hay que actualizar la tabla de precios.

## Telemetría privada

`public.ai_provider_events` registra modelo solicitado y efectivo, tokens de
entrada/cache/salida, costo estimado, latencia, estado, código de error e IDs de
solicitud. No guarda contenido de usuarios. La tabla tiene RLS, no posee
políticas de lectura pública y revoca acceso a `anon` y `authenticated`; solo el
servidor con `service_role` puede escribir o consultar.

Consulta mensual para el SQL Editor de Supabase:

```sql
select
  date_trunc('day', created_at) as day,
  plan,
  coalesce(provider_model, requested_model) as model,
  count(*) filter (where status = 'succeeded') as successful_requests,
  count(*) filter (where status <> 'succeeded') as unsuccessful_requests,
  sum(input_tokens) as input_tokens,
  sum(cached_input_tokens) as cached_input_tokens,
  sum(output_tokens) as output_tokens,
  round(sum(estimated_cost_usd), 4) as estimated_cost_usd
from public.ai_provider_events
where created_at >= date_trunc('month', now())
group by 1, 2, 3
order by 1 desc, 2, 3;
```

También conviene revisar semanalmente los registros estructurados
`ai.request.failed`, `ai.request.cancelled` y `ai.telemetry.*` en Vercel.

## Regla operativa de presupuesto

Durante el primer mes, comparar el total estimado con la factura real de
OpenAI y revisar los modelos cuyo costo figure `null`. Luego configurar en el
proyecto de OpenAI una alerta temprana y un presupuesto mensual acorde al
margen del producto. Las alertas externas complementan las cuotas de esta
aplicación: no deben considerarse un corte instantáneo de tráfico.

Referencias oficiales:

- https://developers.openai.com/api/docs/models/gpt-5-mini
- https://developers.openai.com/api/docs/models/gpt-5.4-mini
- https://developers.openai.com/cookbook/articles/per_run_spending_controller_responses_api
