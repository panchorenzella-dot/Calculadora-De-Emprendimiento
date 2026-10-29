# Etapa 1 — claridad y experiencia

Fecha: 29 de octubre de 2026.

## Alcance

Portada orientada a necesidades, interpretación dinámica, gráficos para las 20 calculadoras y colores semánticos. Se mantiene el diseño oscuro de Growtella. La etapa 2 (análisis de Search Console/GA4 y propuestas de títulos SEO) queda pendiente de aprobación.

La implementación conserva los motores matemáticos existentes: `lib/calculations/business.ts`, `lib/calculations/investments.ts`, `lib/calculations/core.ts` y `lib/argentinaCalculators.ts` no tienen cambios de fórmulas.

## Decisiones

- La portada explica el alcance real del sitio y ofrece seis accesos por necesidad.
- Cada interpretación consume el resultado de la calculadora, explica el concepto y explicita inclusiones y límites.
- Las barras de evolución usan las simulaciones existentes en cada período. El último punto coincide con el resultado final. Se separan aportes y rendimiento y se limita la cantidad de barras para mantener legibilidad.
- Los gráficos usan HTML/CSS, sin agregar dependencias. Solo aparecen después de un cálculo válido.
- Todas las comparaciones tienen valores visibles, moneda o unidad, y tabla accesible desplegable. Los negativos se distinguen por signo, texto y color.
- Se reserva verde luminoso `#4ade80` para resultados positivos y acciones confirmatorias; rosa/rojo `#fb7185` para pérdidas y acciones destructivas. Los costos e impuestos se muestran neutrales: pagar más IVA no significa perder dinero.
- Las etiquetas cambian de Ganancia a Pérdida cuando corresponde. El guardado conserva la etiqueta original para comparar ambos escenarios en la misma fila.
- Se invalidan resultados al editar inputs o modos. Durante el cálculo asíncrono de Margen la comparación espera a que termine.
- Se protege Precio de venta durante su carga inicial y se espera al montaje de las calculadoras con streaming antes de insertar las acciones de guardado y comparación.
- Los colores también se aplican a métricas del perfil, detalle y comparación de escenarios, y a acciones de ingreso, guardado y contratación.
- Se conserva el estado del trabajo previo de diseño, registro contextual y promoción. Las capturas personales y materiales de LinkedIn ajenos a la entrega quedan fuera del commit.

## Calculadoras revisadas

| Ruta | Gráfico y explicación |
|---|---|
| `/markup` | Precio, costo total, cargos y resultado por unidad; diferencia margen/markup. |
| `/margen` | Ventas netas, costos incluidos y resultado mensual; contribución unitaria y caja. |
| `/punto-de-equilibrio` | Ventas estimadas y unidades mínimas; caso sin equilibrio alcanzable. |
| `/reventa` | Ingresos mensuales, costos y ganancia o pérdida. |
| `/produccion` | Facturación, costos y resultado con el volumen ingresado. |
| `/cafeteria` | Ingresos, costos y resultado mensual estimado. |
| `/hamburgueseria` | Ingresos, costos y resultado mensual estimado. |
| `/distribuidora` | Ingresos, costos y resultado mensual estimado. |
| `/intermediarios` | Ingreso por comisiones, gastos y resultado; distingue valor de operaciones. |
| `/roi` | Inversión inicial, retorno bruto y resultado neto del período. |
| `/roi-inversion` | Total invertido con costos, valor final y ganancia o pérdida. |
| `/interes-compuesto` | Barras por período, aportes e interés, misma frecuencia del motor. |
| `/aporte-mensual` | Barras por período con aumento anual del aporte cuando corresponde. |
| `/meta-ahorro` | Meta, ahorro inicial, aportes y capital final; aporte necesario. |
| `/recupero-capital` | Recuperado y pendiente en el horizonte; ausencia de recupero calculable. |
| `/rendimiento-real` | Rendimiento nominal, inflación y rendimiento real del mismo período. |
| `/iva-producto` | Neto, IVA y total unitario; separación correcta del IVA incluido. |
| `/iva-mensual` | Débito, crédito, anticipos y saldo; distingue tipos de saldo a favor. |
| `/ingresos-brutos` | Impuesto determinado, créditos y saldo; alcance de régimen local. |
| `/costo-laboral` | Caja, provisiones y costo mensualizado; diferencia provisión/pago. |

## Archivos principales

- `components/CalculatorInterpretation.tsx`: interpretación y selección de datos por calculadora.
- `components/ResultInsight.tsx`: gráficos, unidades y tabla accesible.
- `lib/calculations/evolution.ts`: muestreo temporal de las funciones existentes.
- `lib/resultPresentation.ts`: colores y etiquetas de ganancia/pérdida con números locales.
- Las 20 páginas/componentes bajo `app/(app)/`: integración de gráficos e invalidación.
- `app/(app)/page.tsx`: portada y accesos por necesidad.
- `components/Card.tsx`, `CalculatorPrimitives.tsx`: componentes compartidos.
- `CalculatorScenarioCapture.tsx`: captura consistente y claves estables de métricas.
- `ProfilePage.tsx`, `ScenarioDetail.tsx`, `ScenarioComparison.tsx`: presentación coherente de los resultados guardados.
- `AuthModal.tsx`, `SaveScenarioButton.tsx`, `CompareScenarioButton.tsx`, `PricingSelector.tsx`, `NavBar.tsx`, `ProfileOnboarding.tsx`, `HomeProfitPreview.tsx`: acciones y estados.
- `app/globals.css`: paleta, contraste, anchos y movimiento reducido.
- `tests/resultPresentation.test.ts`, `tests/e2e/results-overview.spec.ts`, `tests/e2e/discovery.spec.ts`, `tests/e2e/pricing.spec.ts`: regresiones y evidencia visual.

## Verificación

- Pruebas unitarias: 55, incluyendo motores de las 20 calculadoras, entradas vacías/cero, decimales, negativos, valores extremos, validación y límites de simulación.
- Evolución: último punto y aportes reconciliados con los motores existentes, incluidos aumento anual, períodos fraccionarios y horizonte máximo.
- Navegador: contrato de las 20 calculadoras, resultados y tablas, moneda y etiquetas, guardado, comparación, registro, planes, enlaces y catálogo.
- Resultado final: **66 de 66 pruebas de navegador aprobadas sobre el build de producción local**, además de 55 de 55 pruebas unitarias. El flujo de Precio de venta pasó también cuatro repeticiones consecutivas.
- En cada calculadora se prueba también un viewport de 390 × 844 y ausencia de desborde horizontal. La suite móvil usa emulación de Pixel 5.
- Pérdida verificada como texto negativo, etiqueta Pérdida, color rojo y clave estable para guardar/comparar.
- TypeScript, ESLint y `git diff --check`.
- Build de producción con Webpack completado, 64 páginas generadas. Turbopack local encontró una restricción del entorno al crear procesos/puertos de PostCSS; se verificó el mismo código con el compilador alternativo soportado por Next.
- No se agregó una librería de gráficos. Las rutas públicas siguen prerenderizadas. No se presenta una auditoría Lighthouse ni una medición de Core Web Vitals de campo como si se hubieran realizado.

## Evidencia visual

Las pruebas generan imágenes en `artifacts/stage1/`: portada en 1280 y 390 píxeles, interés compuesto, reventa e IVA en escritorio/celular, y caso de pérdida.

## Límites y pendientes

- Las proyecciones dependen de los supuestos ingresados; no incorporan datos externos de mercado ni tasas fiscales verificadas automáticamente.
- No se realizaron compras reales ni escrituras de prueba sobre cuentas de usuarios para comprobar estas mejoras visuales.
- El análisis de Analytics/Search Console y los cambios de metadatos SEO de la etapa 2 no se comenzaron.
- Los controles automáticos y la revisión visual no equivalen a una certificación completa de accesibilidad.
- La promoción existente termina el 31 de octubre; conserva el vencimiento ya definido.

Confirmación: los motores y fórmulas existentes se conservan y sus pruebas de regresión continúan pasando.
