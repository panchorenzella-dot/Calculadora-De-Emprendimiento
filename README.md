# Calculadora Emprendedora

Aplicacion web con calculadoras online para emprendedores, comercios y proyectos chicos. La idea es ayudar a estimar precios, costos, margenes, rentabilidad, punto de equilibrio, recupero de inversion, ahorro e interes compuesto de forma simple.

## Sitio en producción

- [Calculadora Emprendedora](https://www.calculadoraemprendedora.com/)
- [Catálogo completo de calculadoras](https://www.calculadoraemprendedora.com/calculadoras)
- [Sitemap](https://www.calculadoraemprendedora.com/sitemap.xml), generado a partir del catálogo para incluir todas las herramientas disponibles.

## Que incluye

- Catalogo de calculadoras con buscador.
- Hero interactivo con ganancia, margen y markup en vivo; el cálculo completo recibe los mismos importes sin volver a cargarlos.
- Precio de venta con selector de markup sobre costo o margen sobre precio y equivalencia instantánea.
- Ocho calculadoras destacadas, las 20 herramientas agrupadas en cinco categorías en la home y sugerencias relacionadas en cada calculadora.
- Próximos pasos contextuales en precio, margen y punto de equilibrio: Compra Negocio para escenarios con margen de al menos 30%, ganancia mensual positiva y equilibrio por debajo del 70% de las ventas estimadas; Diagnóstico 360° de Growtella después de dos escenarios distintos con pérdidas o ventas insuficientes en la misma sesión. Se guarda solo un contador y una huella del resultado en el navegador, sin enviar los importes a estos destinos.
- Calculadoras para margen, precio de venta, punto de equilibrio, ROI, recupero, interes compuesto, ahorro y rendimiento real.
- Calculadoras por rubro, como hamburgueseria, cafeteria, produccion, reventa e intermediarios.
- Calculadoras de [IVA por producto](https://www.calculadoraemprendedora.com/iva-producto), [IVA mensual](https://www.calculadoraemprendedora.com/iva-mensual), Ingresos Brutos y costo laboral, visibles en la sección de impuestos del catálogo.
- Formato de moneda en ARS y USD.
- Validacion de datos en la API de calculo.
- Paginas basicas para SEO, contacto, robots y sitemap.

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zod

## Como correr el proyecto

Instalar dependencias:

```bash
npm install
```

Iniciar el entorno de desarrollo:

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

## Scripts utiles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Operaciones

- [Costos, límites y monitoreo de la IA](docs/operations/ai-costs.md)
- [Backups cifrados de Supabase y simulacro de restauración](docs/operations/supabase-backups.md)
- [Política segura de caché](docs/operations/caching.md)

## Objetivo del proyecto

El objetivo de Calculadora Emprendedora es ofrecer herramientas gratuitas y faciles de usar para que una persona pueda tomar mejores decisiones antes de vender, invertir o proyectar un negocio.
