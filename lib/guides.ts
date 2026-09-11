export type GuideTopic = "business" | "investment" | "taxes" | "industries";

export type Guide = {
  slug: string;
  topic: GuideTopic;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  steps: Array<{ title: string; copy: string }>;
  formula?: { expression: string; explanation: string };
  example: { title: string; copy: string; result: string };
  pitfalls?: string[];
  calculator: { name: string; href: string; copy: string };
  faqs: Array<{ question: string; answer: string }>;
  sources?: Array<{ name: string; href: string; copy: string }>;
};

export const guides: Guide[] = [
  {
    slug: "como-calcular-precio-de-venta",
    topic: "business",
    eyebrow: "Precios y rentabilidad",
    title: "Cómo calcular el precio de venta sin perder margen",
    description: "Guía práctica para calcular un precio de venta a partir del costo, el margen deseado y los gastos de tu negocio.",
    intro: "Un precio sano no surge de copiar a la competencia ni de duplicar el costo. Primero necesitás conocer cuánto cuesta vender y qué margen debe quedar para sostener el negocio.",
    steps: [
      { title: "Reuní todos los costos", copy: "Incluí compra o producción, embalaje, comisiones, envíos a tu cargo y cualquier costo directamente asociado a la venta." },
      { title: "Elegí un margen objetivo", copy: "El margen se calcula sobre el precio final. Debe dejar espacio para cubrir costos fijos, impuestos y utilidad." },
      { title: "Contrastá el resultado", copy: "Compará el precio calculado con el mercado y simulá alternativas antes de decidir." },
    ],
    formula: {
      expression: "Precio de venta = costo total ÷ (1 − margen objetivo)",
      explanation: "El margen se expresa como decimal y se calcula sobre el precio final. Antes de aplicar la fórmula, incorporá al costo todo gasto que deba recuperar la operación.",
    },
    example: { title: "Ejemplo sencillo", copy: "Con un costo de $8.000 y un margen objetivo del 35%, el precio base se obtiene dividiendo $8.000 por 0,65.", result: "Precio estimado: $12.308 antes de otros impuestos o gastos no incluidos." },
    pitfalls: [
      "Duplicar el costo y asumir que eso siempre produce el margen buscado.",
      "Confundir margen sobre precio con markup sobre costo.",
      "Dejar fuera comisiones, impuestos o costos fijos que la venta debe sostener.",
    ],
    calculator: { name: "Calculadora de precio de venta", href: "/markup", copy: "Ingresá tu costo y margen objetivo para obtener el precio y comparar escenarios." },
    faqs: [
      { question: "¿Margen y markup son lo mismo?", answer: "No. El markup relaciona la ganancia con el costo; el margen la relaciona con el precio de venta." },
      { question: "¿Tengo que incluir impuestos?", answer: "Incluí todo impuesto o retención que afecte el dinero que realmente queda en la operación." },
    ],
  },
  {
    slug: "diferencia-entre-margen-y-markup",
    topic: "business",
    eyebrow: "Conceptos esenciales",
    title: "Diferencia entre margen y markup con un ejemplo",
    description: "Entendé por qué margen y markup no son iguales y evitá errores al calcular precios y ganancias.",
    intro: "Confundir margen con markup puede hacer que un precio parezca más rentable de lo que realmente es. Ambos usan la misma ganancia, pero la comparan contra bases diferentes.",
    steps: [
      { title: "Calculá la ganancia", copy: "Restá el costo al precio de venta. Ese resultado es la ganancia bruta por unidad." },
      { title: "Para el margen, usá el precio", copy: "Dividí la ganancia por el precio de venta y multiplicá por 100." },
      { title: "Para el markup, usá el costo", copy: "Dividí la ganancia por el costo y multiplicá por 100." },
    ],
    formula: {
      expression: "Margen = ganancia ÷ precio · Markup = ganancia ÷ costo",
      explanation: "Ambos indicadores usan la misma ganancia, pero cambian la base de comparación. Por eso nunca deben intercambiarse sin convertirlos.",
    },
    example: { title: "Costo $8.000 · Precio $12.000", copy: "La ganancia bruta es $4.000. El markup es $4.000 ÷ $8.000; el margen es $4.000 ÷ $12.000.", result: "Markup: 50% · Margen: 33,3%." },
    pitfalls: [
      "Aplicar un margen deseado directamente como recargo sobre el costo.",
      "Comparar porcentajes sin confirmar cuál usa costo y cuál usa precio.",
      "Medir ganancia antes de incluir todos los costos variables de la venta.",
    ],
    calculator: { name: "Calculadora de margen", href: "/margen", copy: "Comprobá ambos porcentajes con tus números reales y observá cuánto queda por venta." },
    faqs: [
      { question: "¿Cuál debería usar para medir rentabilidad?", answer: "El margen suele ser más útil para observar qué porcentaje de cada venta queda como ganancia bruta." },
      { question: "¿Un markup del 100% equivale a margen del 100%?", answer: "No. Si duplicás el costo, el markup es 100%, pero el margen sobre el precio es 50%." },
    ],
  },
  {
    slug: "como-calcular-punto-de-equilibrio",
    topic: "business",
    eyebrow: "Ventas mínimas",
    title: "Cómo calcular el punto de equilibrio de un negocio",
    description: "Calculá cuántas unidades necesitás vender para cubrir costos fijos y variables sin perder dinero.",
    intro: "El punto de equilibrio es el nivel de ventas en el que los ingresos alcanzan exactamente para cubrir los costos. Antes de ese punto existe pérdida; después empieza la ganancia.",
    steps: [
      { title: "Sumá los costos fijos", copy: "Incluí alquiler, servicios, sistemas, sueldos y otros gastos que existen aunque no vendas." },
      { title: "Calculá el aporte por unidad", copy: "Restá el costo variable unitario al precio de venta." },
      { title: "Dividí costos por aporte", copy: "Costos fijos ÷ aporte por unidad indica la cantidad mínima de unidades." },
    ],
    formula: {
      expression: "Punto de equilibrio = costos fijos ÷ (precio − costo variable unitario)",
      explanation: "El denominador es el aporte de cada unidad. Si es cero o negativo, vender más no alcanza para cubrir la estructura y primero debe revisarse el precio o el costo.",
    },
    example: { title: "Ejemplo de 50 unidades", copy: "Costos fijos de $300.000, precio de $10.000 y costo variable de $4.000 dejan un aporte de $6.000 por unidad.", result: "$300.000 ÷ $6.000 = 50 unidades para quedar en equilibrio." },
    pitfalls: [
      "Usar el costo total mensual como si fuera costo variable por unidad.",
      "Olvidar comisiones o impuestos que cambian con cada venta.",
      "Tomar el equilibrio como objetivo de ganancia cuando allí el resultado es cero.",
    ],
    calculator: { name: "Calculadora de punto de equilibrio", href: "/punto-de-equilibrio", copy: "Obtené las unidades y ventas necesarias usando tus costos y precios." },
    faqs: [
      { question: "¿El punto de equilibrio incluye ganancia?", answer: "No. En el equilibrio la ganancia es cero: solamente se cubren todos los costos." },
      { question: "¿Qué pasa si cambia el precio?", answer: "Cambia el aporte por unidad y, por lo tanto, la cantidad necesaria para llegar al equilibrio." },
    ],
  },
  {
    slug: "como-calcular-roi-inversion",
    topic: "investment",
    eyebrow: "Decisiones de inversión",
    title: "Cómo calcular el ROI de una inversión",
    description: "Medí el retorno porcentual de una inversión y compará alternativas con una base común.",
    intro: "El ROI relaciona el beneficio obtenido con el capital invertido. Sirve para comparar oportunidades, siempre que utilices el mismo período y contemples todos los costos relevantes.",
    steps: [
      { title: "Definí la inversión total", copy: "Sumá compra, instalación, puesta en marcha y cualquier desembolso necesario." },
      { title: "Calculá el beneficio neto", copy: "Restá la inversión y los costos asociados al valor final o ingresos atribuibles." },
      { title: "Convertí a porcentaje", copy: "Dividí el beneficio neto por la inversión y multiplicá por 100." },
    ],
    formula: {
      expression: "ROI (%) = (beneficio neto ÷ inversión total) × 100",
      explanation: "Usá el beneficio que queda después de todos los costos atribuibles y compará alternativas medidas durante el mismo período.",
    },
    example: { title: "Inversión de $1.000.000", copy: "Si al cierre del período el valor final es $1.250.000, el beneficio atribuible a la inversión es $250.000.", result: "$250.000 ÷ $1.000.000 × 100 = ROI del 25%." },
    pitfalls: [
      "Comparar un ROI mensual con otro anual sin llevarlos al mismo período.",
      "Usar ingresos brutos en lugar del beneficio neto que realmente generó la inversión.",
      "Ignorar costos de mantenimiento, comisiones, impuestos o capital inmovilizado.",
    ],
    calculator: { name: "Calculadora de ROI de inversión", href: "/roi-inversion", copy: "Medí el retorno con tus cifras y compará distintos resultados posibles." },
    faqs: [
      { question: "¿Un ROI positivo alcanza para decidir?", answer: "No siempre. También importa el tiempo, el riesgo, la liquidez y el costo de oportunidad." },
      { question: "¿Puedo comparar inversiones de distinta duración?", answer: "Conviene llevarlas a un período comparable y considerar el tiempo que tarda cada una." },
    ],
  },
  {
    slug: "como-calcular-recupero-inversion",
    topic: "investment",
    eyebrow: "Recupero de capital",
    title: "Cómo saber cuándo recuperás una inversión",
    description: "Estimá cuántos meses necesitás para recuperar el capital invertido a partir del flujo neto esperado.",
    intro: "El período de recupero indica cuánto tarda el proyecto en devolver el capital inicial. Es fácil de entender, pero debe analizarse junto con rentabilidad y riesgo.",
    steps: [
      { title: "Determiná el capital inicial", copy: "Incluí todos los desembolsos necesarios para que la inversión empiece a funcionar." },
      { title: "Estimá el flujo neto", copy: "Usá el dinero que realmente queda por período después de costos operativos." },
      { title: "Calculá el plazo", copy: "Dividí la inversión inicial por el flujo neto mensual esperado." },
    ],
    formula: {
      expression: "Meses de recupero = inversión inicial ÷ flujo neto mensual",
      explanation: "Es un recupero simple y supone flujos estables. Si cambian por mes, acumulalos hasta alcanzar la inversión y compará también rentabilidad y riesgo.",
    },
    example: { title: "Una máquina de $2.000.000", copy: "Si produce un flujo neto adicional de $500.000 mensuales y se mantiene estable, el recupero simple es:", result: "$2.000.000 ÷ $500.000 = 4 meses." },
    pitfalls: [
      "Usar facturación en lugar del flujo neto que queda después de costos.",
      "Suponer que el resultado mensual se mantendrá constante sin probar escenarios.",
      "Decidir solo por recupero sin mirar vida útil, riesgo y valor residual.",
    ],
    calculator: { name: "Calculadora de recupero de capital", href: "/recupero-capital", copy: "Probá diferentes inversiones, ingresos y plazos antes de comprometer el capital." },
    faqs: [
      { question: "¿El recupero considera intereses?", answer: "El recupero simple no descuenta el valor del dinero en el tiempo. Para análisis complejos se necesitan métricas adicionales." },
      { question: "¿Qué pasa con ingresos variables?", answer: "Conviene construir escenarios conservador, esperado y optimista en lugar de usar un solo promedio." },
    ],
  },
  {
    slug: "como-calcular-costo-hamburguesa",
    topic: "industries",
    eyebrow: "Gastronomía",
    title: "Cómo calcular el costo real de una hamburguesa",
    description: "Incluí ingredientes, packaging, comisiones y gastos del negocio para conocer el costo y precio de una hamburguesa.",
    intro: "El costo no termina en la carne y el pan. Para definir un precio sostenible también tenés que contemplar merma, salsas, packaging, comisiones y la parte correspondiente de la operación.",
    steps: [
      { title: "Costeá cada ingrediente", copy: "Convertí el precio de compra a la cantidad realmente utilizada por hamburguesa." },
      { title: "Sumá packaging y venta", copy: "Agregá caja, papel, bolsa, comisión de la plataforma y costo de cobro." },
      { title: "Revisá operación y margen", copy: "Usá el volumen esperado para entender costos fijos y elegir un precio con margen suficiente." },
    ],
    formula: {
      expression: "Costo por hamburguesa = ingredientes + merma + packaging + gastos variables",
      explanation: "El aporte unitario debe cubrir además alquiler, personal, servicios y otros costos fijos. Delivery y venta directa conviene analizarlos por separado.",
    },
    example: { title: "No olvides la merma", copy: "Si comprás insumos que pierden peso o no se aprovechan por completo, el costo utilizable es mayor que el precio nominal.", result: "El precio debe calcularse sobre el costo real por unidad, no solamente sobre los ingredientes principales." },
    pitfalls: [
      "Costear solo carne y pan, dejando afuera salsas, guarnición y packaging.",
      "No convertir correctamente el precio de compra a gramos o porciones utilizadas.",
      "Mezclar el margen del salón con delivery cuando sus comisiones son diferentes.",
    ],
    calculator: { name: "Calculadora para hamburgueserías", href: "/hamburgueseria", copy: "Calculá costo por hamburguesa, margen, precio recomendado y ganancia mensual." },
    faqs: [
      { question: "¿Incluyo el delivery?", answer: "Incluí toda comisión o costo de entrega que quede a cargo del negocio." },
      { question: "¿Cómo reparto alquiler y sueldos?", answer: "Son costos fijos mensuales. El volumen vendido determina cuánto debe aportar cada unidad para cubrirlos." },
    ],
  },
  {
    slug: "como-calcular-iva-mensual",
    topic: "taxes",
    eyebrow: "IVA · Argentina",
    title: "Cómo calcular el IVA mensual paso a paso",
    description: "Aprendé a estimar débito fiscal, crédito fiscal y saldo de IVA del mes sin mezclar importes netos con totales.",
    intro: "El IVA mensual no se obtiene aplicando un único porcentaje a la facturación total. Primero se separan las operaciones por alícuota, después se compara el débito fiscal de las ventas con el crédito fiscal computable de las compras y, por último, se consideran saldos y pagos a cuenta.",
    steps: [
      { title: "Separá los netos por alícuota", copy: "Agrupá ventas y compras sin IVA según la tasa que corresponda. No mezcles el precio final con el monto neto gravado." },
      { title: "Calculá débito y crédito", copy: "Aplicá cada alícuota a las ventas para obtener el débito fiscal y a las compras computables para obtener el crédito fiscal." },
      { title: "Determiná el saldo técnico", copy: "Al débito fiscal restale el crédito fiscal y el saldo técnico trasladable del período anterior." },
      { title: "Restá pagos a cuenta", copy: "Considerá retenciones, percepciones, otros pagos a cuenta y saldos de libre disponibilidad que puedan utilizarse en el período." },
    ],
    formula: {
      expression: "IVA estimado = débito fiscal − crédito fiscal computable − saldos y pagos a cuenta",
      explanation: "Es una estimación operativa. Prorrateos, notas de crédito, importaciones, restituciones, exenciones y regímenes especiales pueden modificar la declaración jurada.",
    },
    example: {
      title: "Ejemplo simplificado al 21%",
      copy: "Ventas netas por $1.000.000 generan $210.000 de débito. Compras computables netas por $400.000 generan $84.000 de crédito. Además, existen $20.000 de retenciones utilizables.",
      result: "$210.000 − $84.000 − $20.000 = $106.000 de IVA estimado a pagar.",
    },
    pitfalls: [
      "Cargar montos finales con IVA donde la calculadora solicita importes netos.",
      "Tomar como crédito fiscal cualquier compra sin verificar que sea computable.",
      "Olvidar notas de crédito, saldos anteriores, retenciones o percepciones del período.",
    ],
    calculator: { name: "Calculadora de IVA mensual", href: "/iva-mensual", copy: "Cargá ventas y compras por alícuota, saldos anteriores y pagos a cuenta para obtener un desglose del período." },
    faqs: [
      { question: "¿Débito fiscal es lo mismo que IVA a pagar?", answer: "No. El débito fiscal nace de las ventas. El importe a pagar surge después de restar crédito fiscal computable y los saldos o pagos a cuenta que correspondan." },
      { question: "¿Puedo computar todo el IVA de mis compras?", answer: "No necesariamente. La vinculación con la actividad, el tipo de comprobante, los prorrateos y otros requisitos pueden limitar el crédito computable." },
      { question: "¿Qué pasa si el resultado es negativo?", answer: "Puede originarse un saldo a favor, pero su naturaleza y forma de utilización dependen de cómo se generó y de la normativa aplicable." },
    ],
    sources: [
      { name: "IVA Simple · ARCA", href: "https://www.arca.gob.ar/iva/iva-simple/especificaciones-especiales.asp", copy: "Criterios oficiales sobre registración de compras, ventas y crédito fiscal computable." },
      { name: "Portal de IVA · ARCA", href: "https://www.arca.gob.ar/iva/", copy: "Acceso a normativa, servicios y material vigente del organismo recaudador." },
    ],
  },
  {
    slug: "como-calcular-ingresos-brutos",
    topic: "taxes",
    eyebrow: "Impuestos provinciales",
    title: "Cómo calcular Ingresos Brutos y descontar retenciones",
    description: "Guía para estimar Ingresos Brutos según base imponible, actividad, jurisdicción, alícuota y pagos a cuenta.",
    intro: "Ingresos Brutos es un impuesto provincial y no tiene una tasa única para todo el país. La base, la alícuota, los mínimos y el tratamiento de los pagos a cuenta dependen de la jurisdicción, la actividad y el régimen en el que esté inscripto el contribuyente.",
    steps: [
      { title: "Identificá la jurisdicción", copy: "Determiná si tributás por régimen local o por Convenio Multilateral y qué parte de los ingresos corresponde a cada jurisdicción." },
      { title: "Definí la base imponible", copy: "Separá ingresos gravados, exentos y no gravados. Como criterio general se parte de los ingresos de la actividad alcanzada, con las excepciones previstas localmente." },
      { title: "Aplicá la alícuota vigente", copy: "Buscá la tasa según el código de actividad y la ley tarifaria del período; también verificá mínimos, escalas y tratamientos diferenciales." },
      { title: "Descontá recaudaciones", copy: "Restá retenciones, percepciones, recaudaciones bancarias y saldos a favor que sean utilizables en esa jurisdicción." },
    ],
    formula: {
      expression: "Saldo estimado = máximo(base imponible × alícuota, mínimo) − pagos a cuenta",
      explanation: "La fórmula sirve para una primera estimación local. Convenio Multilateral requiere distribuir la base y calcular cada jurisdicción por separado.",
    },
    example: {
      title: "Ejemplo con pagos a cuenta",
      copy: "Una base imponible de $2.000.000 con una alícuota supuesta del 3% genera $60.000. Si el período acumula $18.000 entre retenciones y percepciones utilizables, se descuentan del impuesto determinado.",
      result: "$60.000 − $18.000 = $42.000 de saldo estimado.",
    },
    pitfalls: [
      "Copiar una alícuota de otra provincia o de una actividad distinta.",
      "Usar la facturación total sin separar ingresos exentos, no gravados o atribuibles a otra jurisdicción.",
      "Descontar una retención en una jurisdicción o período donde no corresponde computarla.",
    ],
    calculator: { name: "Calculadora de Ingresos Brutos", href: "/ingresos-brutos", copy: "Estimá una jurisdicción con su base, alícuota, mínimo y recaudaciones sufridas, sin fijar tasas que pueden quedar desactualizadas." },
    faqs: [
      { question: "¿Ingresos Brutos se calcula sobre la ganancia?", answer: "En general se calcula sobre la base imponible de ingresos de la actividad gravada, no sobre la ganancia neta del negocio." },
      { question: "¿La alícuota es igual en todas las provincias?", answer: "No. Cambia según jurisdicción, actividad, nivel de ingresos y ley tarifaria vigente." },
      { question: "¿La calculadora resuelve Convenio Multilateral?", answer: "No. Calcula una jurisdicción por vez. Si existe actividad en varias jurisdicciones, primero debe determinarse la distribución de base que corresponda." },
    ],
    sources: [
      { name: "Base imponible · ARBA", href: "https://www.arba.gov.ar/Informacion/IBrutos/IBContribuyentes/baseimponible.asp?lugar=E", copy: "Explicación oficial de la base imponible y la aplicación de alícuotas en la Provincia de Buenos Aires." },
      { name: "Ingresos Brutos · AGIP", href: "https://imagenes.agip.gob.ar/impuestos/ingresos-brutos", copy: "Información oficial sobre actividad, alícuotas y Convenio Multilateral en la Ciudad de Buenos Aires." },
    ],
  },
  {
    slug: "como-calcular-costo-laboral",
    topic: "taxes",
    eyebrow: "Empleo · Argentina",
    title: "Cómo calcular el costo laboral real de un empleado",
    description: "Estimá sueldo, contribuciones, ART, seguros y provisiones para presupuestar una contratación con más precisión.",
    intro: "El sueldo bruto es solo una parte del costo que afronta un empleador. Para presupuestar una incorporación conviene separar el costo mensual de caja de las obligaciones anuales que deben provisionarse, como el sueldo anual complementario y el impacto de las vacaciones.",
    steps: [
      { title: "Partí del sueldo bruto", copy: "Usá la remuneración bruta pactada y verificá la escala y los adicionales del convenio colectivo aplicable." },
      { title: "Sumá cargas y coberturas", copy: "Agregá contribuciones patronales, obra social, ART, seguro y conceptos específicos de la actividad o convenio." },
      { title: "Mensualizá obligaciones anuales", copy: "Reservá cada mes la parte proporcional del aguinaldo, sus cargas y el costo adicional asociado a vacaciones." },
      { title: "Incluí costos internos", copy: "Equipamiento, uniforme, medicina prepaga, selección, capacitación u otros beneficios también forman parte del presupuesto." },
    ],
    formula: {
      expression: "Costo completo mensual = sueldo bruto + cargas + ART + seguros + otros costos + provisiones",
      explanation: "Las tasas y bases pueden cambiar por actividad, convenio, tipo de empleador, topes, beneficios o modalidad de contratación; por eso deben validarse antes de decidir.",
    },
    example: {
      title: "Ejemplo de presupuesto, no de liquidación",
      copy: "Si un sueldo bruto es $1.000.000 y los conceptos mensuales cargados suman $300.000, el costo de caja es $1.300.000. Si las provisiones mensuales estimadas agregan $120.000, deben presupuestarse aparte.",
      result: "$1.300.000 + $120.000 = $1.420.000 de costo mensual completo estimado.",
    },
    pitfalls: [
      "Presupuestar solamente el sueldo de bolsillo o solamente el sueldo bruto.",
      "Usar una tasa genérica sin revisar convenio, ART, topes, detracciones o beneficios vigentes.",
      "Olvidar aguinaldo, vacaciones, seguros y costos internos de incorporar a la persona.",
    ],
    calculator: { name: "Calculadora de costo laboral", href: "/costo-laboral", copy: "Ajustá cada porcentaje y concepto a tu situación para separar costo de caja y costo completo mensualizado." },
    faqs: [
      { question: "¿Costo laboral y sueldo bruto son lo mismo?", answer: "No. El costo laboral suma al bruto las obligaciones y gastos que están a cargo del empleador." },
      { question: "¿Por qué se provisiona el aguinaldo?", answer: "Porque se paga en momentos específicos del año, pero se genera durante los meses trabajados. Reservarlo mensualmente evita subestimar el presupuesto anual." },
      { question: "¿La calculadora reemplaza una liquidación de haberes?", answer: "No. Es una herramienta de presupuesto. La liquidación debe contemplar la normativa, el convenio y la situación particular del trabajador y del empleador." },
    ],
    sources: [
      { name: "Ley de Contrato de Trabajo actualizada", href: "https://www.argentina.gob.ar/normativa/nacional/25552/actualizacion", copy: "Texto oficial actualizado de la normativa laboral general." },
      { name: "Salario, aportes y contribuciones", href: "https://www.argentina.gob.ar/node/12243", copy: "Información oficial sobre remuneración, aportes, contribuciones y sueldo anual complementario." },
    ],
  },
  {
    slug: "como-calcular-interes-compuesto",
    topic: "investment",
    eyebrow: "Ahorro e inversión",
    title: "Cómo calcular interés compuesto con aportes mensuales",
    description: "Entendé cómo crece un capital con reinversión de intereses, plazo, tasa y aportes periódicos.",
    intro: "En el interés compuesto, cada período genera rendimiento sobre el capital inicial y sobre los intereses acumulados. El tiempo y la frecuencia de capitalización son determinantes, y los aportes periódicos pueden pesar tanto como la tasa.",
    steps: [
      { title: "Unificá tasa y período", copy: "Si la tasa es anual y la capitalización es mensual, convertí la tasa al período correspondiente antes de calcular." },
      { title: "Definí el plazo", copy: "Expresá la cantidad de períodos con la misma frecuencia de la tasa: meses con tasa mensual, años con tasa anual." },
      { title: "Proyectá el capital inicial", copy: "Multiplicá el capital por uno más la tasa periódica elevado a la cantidad de períodos." },
      { title: "Agregá los aportes", copy: "Cada aporte capitaliza durante un tiempo distinto. La fecha del depósito cambia el valor futuro acumulado." },
    ],
    formula: {
      expression: "Capital futuro = capital inicial × (1 + tasa periódica)ⁿ + valor futuro de los aportes",
      explanation: "La fórmula supone una tasa constante y reinversión. Para evaluar poder de compra también conviene contrastar el resultado con inflación, impuestos y costos.",
    },
    example: {
      title: "Ejemplo sin aportes adicionales",
      copy: "Un capital de $100.000 colocado durante 12 meses a una tasa efectiva mensual supuesta del 2% capitaliza doce veces.",
      result: "$100.000 × (1,02)¹² = $126.824 de capital final aproximado.",
    },
    pitfalls: [
      "Usar una tasa anual como si fuera mensual o dividir una tasa efectiva sin convertirla correctamente.",
      "Comparar resultados nominales de distintos plazos sin considerar inflación ni impuestos.",
      "Suponer que una tasa variable permanecerá constante durante toda la proyección.",
    ],
    calculator: { name: "Calculadora de interés compuesto", href: "/interes-compuesto", copy: "Proyectá capital inicial, aportes mensuales, tasa y plazo para ver cuánto aportaste y cuánto generó el rendimiento." },
    faqs: [
      { question: "¿Qué significa capitalizar intereses?", answer: "Significa sumar el rendimiento al capital para que también genere rendimiento en los períodos siguientes." },
      { question: "¿TNA y TEA son intercambiables?", answer: "No. Describen la tasa de manera distinta. Antes de calcular hay que conocer la frecuencia de capitalización y convertirlas a una base comparable." },
      { question: "¿La proyección garantiza el resultado?", answer: "No. Es una simulación basada en una tasa constante; una inversión real puede variar y tener comisiones, impuestos o pérdidas." },
    ],
  },
  {
    slug: "como-calcular-rentabilidad-reventa",
    topic: "industries",
    eyebrow: "Compra y venta",
    title: "Cómo calcular la rentabilidad de un negocio de reventa",
    description: "Calculá costo real, ganancia por unidad, margen, punto de equilibrio y recupero del capital en reventa.",
    intro: "En reventa, la diferencia entre precio de compra y precio de venta no es la ganancia final. También pesan comisiones, medios de pago, envíos, packaging, devoluciones, impuestos y costos fijos; omitirlos puede convertir una venta aparentemente rentable en una pérdida.",
    steps: [
      { title: "Armá el costo puesto a la venta", copy: "Sumá compra, flete de entrada, acondicionamiento y cualquier gasto necesario para disponer de la unidad." },
      { title: "Calculá gastos por operación", copy: "Incluí comisión del canal, costo de cobro, envío a tu cargo, packaging y una previsión razonable de devoluciones." },
      { title: "Medí el aporte unitario", copy: "Restá al precio todos los costos variables de esa venta. Ese aporte debe cubrir costos fijos y luego generar utilidad." },
      { title: "Llevá el resultado al mes", copy: "Multiplicá por las unidades esperadas y restá alquiler, sistemas, publicidad, sueldos y otros gastos fijos." },
    ],
    formula: {
      expression: "Ganancia neta mensual = (precio − costo de compra − gastos por venta) × unidades − costos fijos",
      explanation: "El margen unitario describe cada operación; la ganancia mensual incorpora volumen y estructura. Necesitás ambos para evaluar el negocio.",
    },
    example: {
      title: "Ejemplo de 100 unidades",
      copy: "Comprás a $8.000, vendés a $14.000 y gastás $2.000 por venta. El aporte es $4.000. Con 100 unidades obtenés $400.000 antes de costos fijos; si estos suman $250.000, todavía deben restarse.",
      result: "($14.000 − $8.000 − $2.000) × 100 − $250.000 = $150.000 netos estimados.",
    },
    pitfalls: [
      "Llamar ganancia a la diferencia entre compra y venta sin descontar gastos de la operación.",
      "Aplicar un porcentaje de margen sobre el costo cuando se quería margen sobre el precio.",
      "Proyectar un volumen optimista sin contemplar stock inmovilizado, roturas o devoluciones.",
    ],
    calculator: { name: "Calculadora para compra y venta", href: "/reventa", copy: "Medí rentabilidad por unidad y por mes, punto de equilibrio, ROI mensual y recupero del capital." },
    faqs: [
      { question: "¿Margen y markup son lo mismo en reventa?", answer: "No. El margen divide la ganancia por el precio; el markup la divide por el costo. Para comparar operaciones conviene indicar cuál se está usando." },
      { question: "¿Dónde incluyo la comisión de la plataforma?", answer: "Dentro de los gastos por venta. Si es porcentual, calculala sobre la base que cobre la plataforma y convertí el resultado a dinero por unidad." },
      { question: "¿Qué indica el punto de equilibrio?", answer: "La cantidad aproximada de unidades necesarias para que el aporte acumulado cubra los costos fijos del período." },
    ],
  },
  {
    slug: "como-calcular-costos-produccion",
    topic: "industries",
    eyebrow: "Producción",
    title: "Cómo calcular costos de producción y costo unitario",
    description: "Sumá materiales, mano de obra, packaging, merma y costos fijos para conocer el costo real de producir.",
    intro: "El costo de producción debe representar los recursos consumidos para fabricar y vender una unidad. Separar costos variables de costos fijos permite fijar precios, medir capacidad y entender por qué el costo unitario cambia cuando varía el volumen.",
    steps: [
      { title: "Costeá materiales utilizados", copy: "Convertí cada compra a la cantidad efectivamente consumida por unidad e incorporá merma, desperdicio y rendimiento real." },
      { title: "Asigná mano de obra directa", copy: "Medí el tiempo productivo por unidad y multiplicalo por su costo por hora, incluyendo las cargas que correspondan." },
      { title: "Sumá variables y packaging", copy: "Agregá envases, etiquetas, energía variable, tercerizaciones y otros insumos que crecen con la producción." },
      { title: "Analizá los costos fijos", copy: "No desaparecen aunque produzcas menos. Usá el aporte por unidad y el volumen para saber cuándo se cubren, sin esconderlos en un reparto arbitrario." },
    ],
    formula: {
      expression: "Costo variable unitario = materiales + mano de obra directa + packaging + otros variables",
      explanation: "La utilidad mensual surge de multiplicar el aporte unitario por el volumen y restar costos fijos. Si querés un costo completo por unidad, el reparto de fijos debe usar un volumen realista.",
    },
    example: {
      title: "Ejemplo de producción mensual",
      copy: "Cada unidad consume $3.000 de producción, $500 de packaging y $500 de otros variables. Se vende a $7.000, se fabrican 200 unidades y los costos fijos son $400.000.",
      result: "Aporte unitario $3.000; resultado mensual: $3.000 × 200 − $400.000 = $200.000.",
    },
    pitfalls: [
      "Usar el precio de compra de un paquete completo en lugar del consumo real por unidad.",
      "No actualizar recetas, tiempos, rendimiento y merma cuando cambia el proceso.",
      "Repartir costos fijos sobre una producción ideal que el negocio no alcanza de forma sostenida.",
    ],
    calculator: { name: "Calculadora de producción", href: "/produccion", copy: "Calculá costo variable unitario, ventas, ganancia mensual y punto de equilibrio con tu ritmo real de producción." },
    faqs: [
      { question: "¿La mano de obra es costo fijo o variable?", answer: "Depende de cómo se comporte. El tiempo directamente consumido por unidad puede tratarse como variable; salarios mensuales que no cambian con el volumen suelen analizarse como fijos." },
      { question: "¿Cómo calculo la merma?", answer: "Compará la cantidad comprada con la cantidad realmente utilizable. Dividí el costo total por las unidades efectivas, no por las teóricas." },
      { question: "¿Costo unitario y precio de venta son lo mismo?", answer: "No. El precio debe cubrir el costo variable, aportar a los costos fijos, contemplar impuestos y dejar la utilidad objetivo." },
    ],
  },
  {
    slug: "como-calcular-margen-ganancia-negocio",
    topic: "business",
    eyebrow: "Ganancia y rentabilidad",
    title: "Cómo calcular el margen de ganancia real de un negocio",
    description: "Separá facturación, costos variables, costos fijos e impuestos para medir cuánto gana realmente tu negocio.",
    intro: "Facturar más no siempre significa ganar más. Para conocer la rentabilidad necesitás distinguir la ganancia por operación, el margen bruto y el resultado neto del mes. Cada indicador responde una pregunta distinta y evita decidir solamente por el dinero que entra.",
    steps: [
      { title: "Calculá las ventas netas", copy: "Partí de la facturación del período y separá impuestos incluidos, devoluciones y descuentos para no tratarlos como ingreso propio." },
      { title: "Restá costos variables", copy: "Incluí mercadería, insumos, comisiones, envíos y todo gasto que aparece cuando concretás una venta." },
      { title: "Descontá la estructura", copy: "Restá alquiler, sueldos, sistemas, servicios, publicidad y otros costos fijos del período." },
      { title: "Compará margen y objetivo", copy: "Dividí la ganancia por las ventas netas y contrastá el porcentaje con el capital, el tiempo y el riesgo asumidos." },
    ],
    formula: {
      expression: "Margen neto (%) = ganancia neta ÷ ventas netas × 100",
      explanation: "La ganancia neta surge después de costos variables y fijos. Si faltan impuestos, retiros o costos financieros, el porcentaje todavía no representa el resultado final.",
    },
    example: {
      title: "Ejemplo de un mes",
      copy: "Ventas netas de $3.000.000 menos $1.800.000 de costos variables y $750.000 de costos fijos dejan $450.000 antes de otros conceptos no incluidos.",
      result: "$450.000 ÷ $3.000.000 × 100 = margen neto estimado del 15%.",
    },
    pitfalls: [
      "Medir el margen sobre facturación con impuestos incluidos.",
      "Olvidar costos fijos porque no pertenecen a una venta particular.",
      "Comparar meses con estacionalidad o inversiones extraordinarias sin aclararlo.",
    ],
    calculator: { name: "Calculadora de margen de ganancia", href: "/margen", copy: "Ingresá ventas, costos e inversión para ver margen, punto de equilibrio y retorno en un mismo análisis." },
    faqs: [
      { question: "¿Margen bruto y margen neto son iguales?", answer: "No. El margen bruto descuenta costos directos o variables; el margen neto también contempla la estructura y los demás gastos del período." },
      { question: "¿Un margen positivo significa que el negocio es conveniente?", answer: "No por sí solo. También hay que evaluar el capital invertido, el tiempo de trabajo, el riesgo y la estabilidad de las ventas." },
      { question: "¿Conviene medir por producto o por mes?", answer: "Ambos. El margen por producto ayuda a fijar precios; el resultado mensual confirma si el volumen alcanza para sostener toda la estructura." },
    ],
  },
  {
    slug: "como-sacar-iva-de-un-precio",
    topic: "taxes",
    eyebrow: "IVA en precios",
    title: "Cómo sacar el IVA de un precio o agregarlo al valor neto",
    description: "Calculá el IVA incluido en un precio final o sumalo a un importe neto usando la alícuota correcta.",
    intro: "Agregar IVA y extraer IVA no son la misma operación. Para pasar de neto a total se aplica la tasa sobre el neto; para separar el impuesto de un precio final hay que dividir por uno más la alícuota. Restar directamente el porcentaje al total produce un resultado incorrecto.",
    steps: [
      { title: "Confirmá qué importe tenés", copy: "Definí si el valor está expresado sin IVA o si ya es el precio final con el impuesto incluido." },
      { title: "Elegí la alícuota aplicable", copy: "La tasa depende del bien, servicio y operación. Verificala antes de emitir una factura o presupuesto." },
      { title: "Sumá IVA al neto", copy: "Multiplicá el valor neto por uno más la tasa expresada como decimal para obtener el total." },
      { title: "Extraé IVA del total", copy: "Dividí el total por uno más la tasa para recuperar el neto; luego restá el neto al total para conocer el impuesto." },
    ],
    formula: {
      expression: "Total = neto × (1 + tasa) · Neto = total ÷ (1 + tasa)",
      explanation: "Si la tasa es 21%, se usa 0,21 en la fórmula. La calculadora permite elegir la alícuota sin convertirla manualmente.",
    },
    example: {
      title: "Ejemplo al 21%",
      copy: "Un valor neto de $100.000 genera $21.000 de IVA y un total de $121.000. Para volver al neto no se resta 21% al total: se divide $121.000 por 1,21.",
      result: "$121.000 ÷ 1,21 = $100.000 netos y $21.000 de IVA.",
    },
    pitfalls: [
      "Restar la alícuota directamente a un precio que ya incluye IVA.",
      "Aplicar una tasa por costumbre sin verificar el tratamiento de la operación.",
      "Confundir el IVA facturado con un ingreso o un costo definitivo del negocio.",
    ],
    calculator: { name: "Calculadora de IVA por producto", href: "/iva-producto", copy: "Agregá IVA a un importe neto o separá neto e impuesto desde un precio final." },
    faqs: [
      { question: "¿Por qué no puedo restar 21% al precio final?", answer: "Porque el 21% fue calculado sobre el neto, no sobre el total. Para recuperar la base hay que dividir el total por 1,21." },
      { question: "¿Qué alícuota tengo que usar?", answer: "Depende del bien, servicio y operación. Consultá la documentación y normativa vigente o validalo con un profesional." },
      { question: "¿El resultado sirve para presentar IVA?", answer: "Sirve para descomponer un precio. La declaración mensual requiere considerar todas las operaciones, créditos, saldos y ajustes del período." },
    ],
    sources: [
      { name: "Portal de IVA · ARCA", href: "https://www.arca.gob.ar/iva/", copy: "Información oficial sobre el impuesto, servicios y normativa aplicable." },
    ],
  },
  {
    slug: "como-calcular-inversion-aportes-mensuales",
    topic: "investment",
    eyebrow: "Aportes periódicos",
    title: "Cómo calcular una inversión con aportes mensuales",
    description: "Proyectá cuánto podés acumular al invertir un monto inicial y sumar aportes todos los meses.",
    intro: "Una inversión con aportes periódicos combina dos motores: el capital que ya está invertido y el dinero nuevo que entra cada mes. Cada aporte tiene un plazo distinto para rendir, por eso no alcanza con multiplicar el aporte mensual por la cantidad de meses y aplicar una sola tasa.",
    steps: [
      { title: "Definí capital y aporte", copy: "Separá el monto inicial del aporte mensual para poder distinguir cuánto acumulaste por ahorro y cuánto por rendimiento." },
      { title: "Convertí la tasa", copy: "Llevá el rendimiento a una tasa efectiva del mismo período que los aportes, normalmente mensual." },
      { title: "Proyectá cada flujo", copy: "El capital inicial rinde durante todo el plazo; cada aporte mensual capitaliza solamente desde el momento en que se invierte." },
      { title: "Probá escenarios", copy: "Compará una tasa conservadora, una esperada y una optimista. También ensayá pausas o aumentos futuros del aporte." },
    ],
    formula: {
      expression: "Valor futuro = capital inicial × (1 + i)ⁿ + aporte × ((1 + i)ⁿ − 1) ÷ i",
      explanation: "La segunda parte supone aportes iguales al final de cada período. Si los aportes se hacen al comienzo o cambian con el tiempo, la proyección debe ajustarse.",
    },
    example: {
      title: "Ejemplo a 24 meses",
      copy: "Con $200.000 iniciales, aportes de $50.000 al final de cada mes y una tasa mensual supuesta del 1%, se proyectan por separado el capital inicial y la serie de aportes.",
      result: "Aportes totales: $1.400.000; valor futuro aproximado: $1.602.620.",
    },
    pitfalls: [
      "Tratar una TNA o una TEA como si fuera directamente una tasa mensual.",
      "Suponer que todos los aportes rinden durante el plazo completo.",
      "Tomar una proyección nominal como poder de compra real garantizado.",
    ],
    calculator: { name: "Calculadora de inversión con aporte mensual", href: "/aporte-mensual", copy: "Simulá capital, aporte, aumentos anuales, tasa y plazo en pesos o dólares." },
    faqs: [
      { question: "¿Qué pasa si aumento el aporte todos los años?", answer: "El capital final puede crecer mucho más, pero cada aumento debe proyectarse desde el mes en que empieza a aplicarse." },
      { question: "¿Conviene aportar al comienzo o al final del mes?", answer: "A igualdad de condiciones, aportar antes deja más tiempo para capitalizar. La diferencia crece con el plazo y la tasa." },
      { question: "¿El resultado ya descuenta inflación?", answer: "No necesariamente. Una proyección nominal debe compararse con la inflación esperada para estimar el poder de compra." },
    ],
  },
  {
    slug: "como-calcular-cuanto-ahorrar-por-mes",
    topic: "investment",
    eyebrow: "Objetivos de ahorro",
    title: "Cómo calcular cuánto ahorrar por mes para llegar a una meta",
    description: "Convertí una meta de dinero y una fecha objetivo en un aporte mensual concreto y comprobable.",
    intro: "Una meta de ahorro mejora cuando deja de ser un número lejano y se transforma en un aporte periódico. El cálculo depende del monto objetivo, el capital ya reunido, el plazo y el rendimiento estimado. Si la fecha o la tasa cambian, también cambia el esfuerzo mensual necesario.",
    steps: [
      { title: "Definí una meta completa", copy: "Indicá el monto, la moneda y la fecha. Si el objetivo sube con la inflación, revisalo periódicamente en lugar de dejarlo fijo." },
      { title: "Restá el capital actual", copy: "El ahorro que ya tenés también puede crecer durante el plazo y reduce el aporte futuro requerido." },
      { title: "Estimá un rendimiento prudente", copy: "Usá una tasa conservadora después de costos e impuestos. Una meta no debería depender de un escenario demasiado optimista." },
      { title: "Ajustá plazo o aporte", copy: "Si el monto mensual no es sostenible, extendé la fecha, aumentá el capital inicial o revisá el tamaño de la meta." },
    ],
    formula: {
      expression: "Aporte requerido = faltante futuro × i ÷ ((1 + i)ⁿ − 1)",
      explanation: "El faltante futuro descuenta lo que alcanzaría el capital actual al final del plazo. Con tasa cero, simplemente se divide el faltante por la cantidad de meses.",
    },
    example: {
      title: "Meta sin rendimiento",
      copy: "Querés reunir $2.400.000 en 12 meses y ya tenés $600.000. Sin considerar rendimiento, faltan $1.800.000 que deben distribuirse en los doce aportes.",
      result: "($2.400.000 − $600.000) ÷ 12 = $150.000 por mes.",
    },
    pitfalls: [
      "Definir una meta en pesos y no actualizarla cuando cambia su costo real.",
      "Usar un rendimiento optimista como si estuviera garantizado.",
      "Elegir un aporte imposible de sostener y abandonar el plan al poco tiempo.",
    ],
    calculator: { name: "Calculadora de meta de ahorro", href: "/meta-ahorro", copy: "Ingresá objetivo, ahorro actual, plazo y rendimiento para estimar el aporte mensual necesario." },
    faqs: [
      { question: "¿Qué hago si no puedo aportar el monto calculado?", answer: "Probá extender el plazo, reducir la meta o sumar un capital inicial. La calculadora permite comparar esas alternativas." },
      { question: "¿Tengo que incluir intereses?", answer: "Solo si existe una inversión razonable detrás del ahorro. Para una planificación conservadora también podés usar rendimiento cero." },
      { question: "¿Cada cuánto conviene recalcular?", answer: "Revisá el plan cuando cambien el precio del objetivo, tus ingresos, la tasa esperada o tu capacidad mensual de ahorro." },
    ],
  },
  {
    slug: "como-calcular-rendimiento-real-inflacion",
    topic: "investment",
    eyebrow: "Inflación y poder de compra",
    title: "Cómo calcular el rendimiento real descontando la inflación",
    description: "Descubrí si una inversión aumentó tu poder de compra comparando rendimiento nominal e inflación.",
    intro: "Una inversión puede mostrar una ganancia nominal y, al mismo tiempo, perder poder de compra. El rendimiento real corrige ese efecto y permite comparar cuánto creció realmente el capital frente al aumento general de precios durante el mismo período.",
    steps: [
      { title: "Usá el mismo período", copy: "Compará rendimiento e inflación medidos entre las mismas fechas. Mezclar una tasa mensual con inflación anual invalida el resultado." },
      { title: "Convertí porcentajes a factores", copy: "Sumá uno a cada tasa expresada como decimal: 20% se convierte en 1,20 y 15% en 1,15." },
      { title: "Dividí ambos factores", copy: "Dividí el factor de rendimiento por el factor de inflación y restá uno para obtener el rendimiento real." },
      { title: "Considerá costos e impuestos", copy: "Para medir el resultado propio, usá el rendimiento neto de comisiones e impuestos cuando corresponda." },
    ],
    formula: {
      expression: "Rendimiento real = ((1 + rendimiento nominal) ÷ (1 + inflación) − 1) × 100",
      explanation: "Restar ambos porcentajes es una aproximación que pierde precisión cuando las tasas son elevadas. La relación de factores conserva el efecto compuesto.",
    },
    example: {
      title: "Ganancia nominal con pérdida real",
      copy: "Si una inversión rindió 20% y la inflación del mismo período fue 25%, el capital creció en dinero, pero menos que los precios.",
      result: "(1,20 ÷ 1,25 − 1) × 100 = rendimiento real de −4%.",
    },
    pitfalls: [
      "Restar tasas de períodos distintos.",
      "Usar el rendimiento bruto cuando existen comisiones o impuestos relevantes.",
      "Interpretar una ganancia nominal como una mejora automática del poder de compra.",
    ],
    calculator: { name: "Calculadora de rendimiento real", href: "/rendimiento-real", copy: "Compará capital inicial, capital final e inflación para medir variación nominal y real." },
    faqs: [
      { question: "¿Puede ser positivo el rendimiento nominal y negativo el real?", answer: "Sí. Ocurre cuando el capital aumenta, pero la inflación del mismo período aumenta más." },
      { question: "¿Por qué no alcanza con restar inflación?", answer: "Porque ambas variaciones se aplican sobre bases multiplicativas. La fórmula exacta divide los factores de crecimiento." },
      { question: "¿Qué inflación debería usar?", answer: "La del mismo período y moneda del análisis. Para decisiones personales, también puede ser útil comparar con el aumento del costo específico de tu objetivo." },
    ],
  },
  {
    slug: "como-calcular-rentabilidad-cafeteria",
    topic: "industries",
    eyebrow: "Cafeterías y bares",
    title: "Cómo calcular costos y rentabilidad de una cafetería",
    description: "Medí costo por pedido, ticket promedio, margen, ganancia mensual y punto de equilibrio de una cafetería.",
    intro: "La rentabilidad de una cafetería depende de mucho más que el costo del café. El mix de productos, la merma, el packaging, las comisiones, los clientes por día y una estructura fija intensa hacen que ticket promedio y aporte por pedido sean indicadores centrales.",
    steps: [
      { title: "Calculá el costo promedio", copy: "Costeá ingredientes, descartables, packaging y merma según el mix real de pedidos, no solamente el producto más vendido." },
      { title: "Medí el ticket promedio", copy: "Dividí las ventas por la cantidad de pedidos. Separá salón, take away y delivery si sus costos son diferentes." },
      { title: "Obtené el aporte por pedido", copy: "Restá al ticket los costos variables y comisiones. Ese aporte es el que sostiene alquiler, personal y servicios." },
      { title: "Proyectá clientes y días", copy: "Multiplicá por clientes diarios y días abiertos; luego restá costos fijos para estimar la ganancia mensual." },
    ],
    formula: {
      expression: "Ganancia mensual = (ticket promedio − costo variable por pedido) × pedidos − costos fijos",
      explanation: "Si los canales tienen comisiones muy distintas, calculalos por separado y sumá sus aportes para evitar que un promedio oculte pérdidas.",
    },
    example: {
      title: "Ejemplo de 1.500 pedidos",
      copy: "Un ticket promedio de $8.000 y un costo variable de $3.200 dejan $4.800 de aporte. Con 1.500 pedidos y $5.500.000 de costos fijos mensuales:",
      result: "$4.800 × 1.500 − $5.500.000 = $1.700.000 de ganancia estimada.",
    },
    pitfalls: [
      "Calcular solamente ingredientes y omitir merma, descartables o comisiones.",
      "Usar un ticket promedio que no representa el mix real de ventas.",
      "Confundir cantidad de clientes con cantidad de pedidos o productos vendidos.",
    ],
    calculator: { name: "Calculadora para cafeterías", href: "/cafeteria", copy: "Probá ticket, costo por pedido, clientes diarios y estructura para conocer tu punto de equilibrio." },
    faqs: [
      { question: "¿Cómo calculo el ticket promedio?", answer: "Dividí la facturación del período por la cantidad de pedidos del mismo período, preferentemente sin mezclar canales muy distintos." },
      { question: "¿El alquiler va en el costo de cada café?", answer: "Es un costo fijo. Podés observar cuánto representa por pedido, pero el punto de equilibrio es más útil para evaluar si el volumen lo cubre." },
      { question: "¿Cómo trato la comisión de delivery?", answer: "Como un costo variable del canal. Conviene comparar el aporte del delivery con el de la venta directa." },
    ],
  },
  {
    slug: "como-calcular-margen-distribuidora",
    topic: "industries",
    eyebrow: "Distribución mayorista",
    title: "Cómo calcular margen, reparto y stock de una distribuidora",
    description: "Calculá margen por caja, costos de reparto, ganancia mensual, punto de equilibrio y capital en stock.",
    intro: "Una distribuidora suele trabajar con márgenes unitarios ajustados y depende del volumen, la rotación y la eficiencia del reparto. Para medir el negocio hay que incorporar bonificaciones, flete, preparación de pedidos, cobranza, devoluciones y el costo de mantener mercadería inmovilizada.",
    steps: [
      { title: "Determiná el costo por unidad", copy: "Incluí compra neta de descuentos, flete de entrada, roturas y cualquier costo necesario para tener la mercadería disponible." },
      { title: "Asigná reparto y venta", copy: "Calculá combustible, chofer, vehículo, preparación y cobranza por unidad o por pedido según el recorrido real." },
      { title: "Medí margen y volumen", copy: "Restá costos variables al precio y multiplicá el aporte por las unidades previstas antes de descontar la estructura fija." },
      { title: "Controlá stock y recupero", copy: "Compará la ganancia mensual con el capital promedio inmovilizado para evaluar rotación, ROI y plazo de recupero." },
    ],
    formula: {
      expression: "Ganancia mensual = aporte por unidad × unidades vendidas − costos fijos",
      explanation: "El aporte por unidad debe incluir compra, bonificaciones, gastos variables y reparto. Un margen positivo puede ser insuficiente si la rotación es baja.",
    },
    example: {
      title: "Ejemplo por caja",
      copy: "Una caja cuesta $18.000, se vende a $24.000 y consume $2.000 de reparto y otros gastos. Deja $4.000 de aporte; con 800 cajas y $2.400.000 de estructura:",
      result: "$4.000 × 800 − $2.400.000 = $800.000 de ganancia mensual estimada.",
    },
    pitfalls: [
      "Mirar solamente el margen porcentual sin medir rotación del stock.",
      "Repartir el costo logístico por igual entre clientes o recorridos muy distintos.",
      "No contemplar bonificaciones, devoluciones, incobrables o mercadería dañada.",
    ],
    calculator: { name: "Calculadora para distribuidoras", href: "/distribuidora", copy: "Estimá margen, reparto, volumen, punto de equilibrio, ROI y capital necesario en mercadería." },
    faqs: [
      { question: "¿Qué margen necesita una distribuidora?", answer: "No existe un porcentaje universal. Debe cubrir reparto, estructura, costo financiero, pérdidas y capital inmovilizado, además de dejar utilidad." },
      { question: "¿Cómo reparto el costo de entrega?", answer: "Podés usar unidades, peso, volumen, distancia o tiempo. Elegí el criterio que mejor explique el consumo real de recursos." },
      { question: "¿Por qué importa la rotación?", answer: "Porque el mismo margen genera retornos muy distintos si el capital vuelve a venderse varias veces o queda inmovilizado durante meses." },
    ],
  },
  {
    slug: "como-calcular-comision-intermediario",
    topic: "industries",
    eyebrow: "Ventas a comisión",
    title: "Cómo calcular comisiones y ganancia de un intermediario",
    description: "Medí comisión neta por operación, gastos comerciales, ganancia mensual, punto de equilibrio y ROI.",
    intro: "Para un intermediario, facturación y ganancia pueden ser números muy diferentes. La comisión bruta debe cubrir adquisición de clientes, traslados, herramientas, impuestos, devoluciones y una estructura que existe incluso cuando no se cierran operaciones.",
    steps: [
      { title: "Definí la base de comisión", copy: "Aclarar si el porcentaje se aplica sobre precio neto, total cobrado, margen del proveedor u otra base evita diferencias posteriores." },
      { title: "Calculá la comisión bruta", copy: "Multiplicá el valor de la operación por la tasa acordada y sumá honorarios fijos si existen." },
      { title: "Restá costos por cierre", copy: "Incluí publicidad, referidos, traslados, medios de pago y todo gasto que aparece al concretar la operación." },
      { title: "Llevá el aporte al mes", copy: "Multiplicá la comisión neta por cierres esperados y restá herramientas, oficina, sueldos y demás costos fijos." },
    ],
    formula: {
      expression: "Ganancia mensual = (valor × comisión − gastos por operación) × operaciones − costos fijos",
      explanation: "Si las operaciones tienen valores muy diferentes, conviene calcular por segmento o usar un promedio ponderado, no un promedio simple.",
    },
    example: {
      title: "Ejemplo de veinte operaciones",
      copy: "Cada operación promedia $500.000, paga 8% de comisión y genera $10.000 de gastos directos. Con 20 cierres y $350.000 de costos fijos:",
      result: "($500.000 × 8% − $10.000) × 20 − $350.000 = $250.000 estimados.",
    },
    pitfalls: [
      "Aplicar la comisión sobre una base distinta de la acordada.",
      "No contemplar operaciones canceladas, impagas o con devolución de comisión.",
      "Proyectar con un ticket promedio que no pondera el mix de ventas.",
    ],
    calculator: { name: "Calculadora de comisiones para intermediarios", href: "/intermediarios", copy: "Calculá comisión por operación, ganancia mensual, equilibrio, recupero y ROI." },
    faqs: [
      { question: "¿Comisión bruta es ganancia?", answer: "No. Primero deben descontarse los gastos directos de cada operación y la estructura mensual necesaria para producir esas ventas." },
      { question: "¿Cómo calculo el punto de equilibrio?", answer: "Dividí los costos fijos por la comisión neta promedio que aporta cada operación." },
      { question: "¿Qué hago si el valor de las operaciones cambia mucho?", answer: "Separá escenarios por segmento o usá un promedio ponderado por cantidad real de operaciones." },
    ],
  },
];

export const guideTopics: Array<{
  id: GuideTopic;
  title: string;
  description: string;
}> = [
  {
    id: "business",
    title: "Precios, costos y rentabilidad",
    description: "Para definir cuánto cobrar, cuidar el margen y conocer el piso de ventas.",
  },
  {
    id: "investment",
    title: "Inversión y ahorro",
    description: "Para proyectar capital, comparar retornos y convertir objetivos en planes.",
  },
  {
    id: "taxes",
    title: "Impuestos y costo laboral",
    description: "Para entender estimaciones de IVA, Ingresos Brutos y contratación en Argentina.",
  },
  {
    id: "industries",
    title: "Costos por tipo de negocio",
    description: "Para contemplar las variables propias de gastronomía, producción, reventa y distribución.",
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function getGuidesByTopic(topic: GuideTopic) {
  return guides.filter((guide) => guide.topic === topic);
}

export function getRelatedGuides(guide: Guide, limit = 3) {
  return guides
    .filter((candidate) => candidate.slug !== guide.slug && candidate.topic === guide.topic)
    .slice(0, limit);
}
