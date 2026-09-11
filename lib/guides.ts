export type Guide = {
  slug: string;
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
    eyebrow: "Precios y rentabilidad",
    title: "Cómo calcular el precio de venta sin perder margen",
    description: "Guía práctica para calcular un precio de venta a partir del costo, el margen deseado y los gastos de tu negocio.",
    intro: "Un precio sano no surge de copiar a la competencia ni de duplicar el costo. Primero necesitás conocer cuánto cuesta vender y qué margen debe quedar para sostener el negocio.",
    steps: [
      { title: "Reuní todos los costos", copy: "Incluí compra o producción, embalaje, comisiones, envíos a tu cargo y cualquier costo directamente asociado a la venta." },
      { title: "Elegí un margen objetivo", copy: "El margen se calcula sobre el precio final. Debe dejar espacio para cubrir costos fijos, impuestos y utilidad." },
      { title: "Contrastá el resultado", copy: "Compará el precio calculado con el mercado y simulá alternativas antes de decidir." },
    ],
    example: { title: "Ejemplo sencillo", copy: "Con un costo de $8.000 y un margen objetivo del 35%, el precio base se obtiene dividiendo $8.000 por 0,65.", result: "Precio estimado: $12.308 antes de otros impuestos o gastos no incluidos." },
    calculator: { name: "Calculadora de precio de venta", href: "/markup", copy: "Ingresá tu costo y margen objetivo para obtener el precio y comparar escenarios." },
    faqs: [
      { question: "¿Margen y markup son lo mismo?", answer: "No. El markup relaciona la ganancia con el costo; el margen la relaciona con el precio de venta." },
      { question: "¿Tengo que incluir impuestos?", answer: "Incluí todo impuesto o retención que afecte el dinero que realmente queda en la operación." },
    ],
  },
  {
    slug: "diferencia-entre-margen-y-markup",
    eyebrow: "Conceptos esenciales",
    title: "Diferencia entre margen y markup con un ejemplo",
    description: "Entendé por qué margen y markup no son iguales y evitá errores al calcular precios y ganancias.",
    intro: "Confundir margen con markup puede hacer que un precio parezca más rentable de lo que realmente es. Ambos usan la misma ganancia, pero la comparan contra bases diferentes.",
    steps: [
      { title: "Calculá la ganancia", copy: "Restá el costo al precio de venta. Ese resultado es la ganancia bruta por unidad." },
      { title: "Para el margen, usá el precio", copy: "Dividí la ganancia por el precio de venta y multiplicá por 100." },
      { title: "Para el markup, usá el costo", copy: "Dividí la ganancia por el costo y multiplicá por 100." },
    ],
    example: { title: "Costo $8.000 · Precio $12.000", copy: "La ganancia bruta es $4.000. El markup es $4.000 ÷ $8.000; el margen es $4.000 ÷ $12.000.", result: "Markup: 50% · Margen: 33,3%." },
    calculator: { name: "Calculadora de margen", href: "/margen", copy: "Comprobá ambos porcentajes con tus números reales y observá cuánto queda por venta." },
    faqs: [
      { question: "¿Cuál debería usar para medir rentabilidad?", answer: "El margen suele ser más útil para observar qué porcentaje de cada venta queda como ganancia bruta." },
      { question: "¿Un markup del 100% equivale a margen del 100%?", answer: "No. Si duplicás el costo, el markup es 100%, pero el margen sobre el precio es 50%." },
    ],
  },
  {
    slug: "como-calcular-punto-de-equilibrio",
    eyebrow: "Ventas mínimas",
    title: "Cómo calcular el punto de equilibrio de un negocio",
    description: "Calculá cuántas unidades necesitás vender para cubrir costos fijos y variables sin perder dinero.",
    intro: "El punto de equilibrio es el nivel de ventas en el que los ingresos alcanzan exactamente para cubrir los costos. Antes de ese punto existe pérdida; después empieza la ganancia.",
    steps: [
      { title: "Sumá los costos fijos", copy: "Incluí alquiler, servicios, sistemas, sueldos y otros gastos que existen aunque no vendas." },
      { title: "Calculá el aporte por unidad", copy: "Restá el costo variable unitario al precio de venta." },
      { title: "Dividí costos por aporte", copy: "Costos fijos ÷ aporte por unidad indica la cantidad mínima de unidades." },
    ],
    example: { title: "Ejemplo de 50 unidades", copy: "Costos fijos de $300.000, precio de $10.000 y costo variable de $4.000 dejan un aporte de $6.000 por unidad.", result: "$300.000 ÷ $6.000 = 50 unidades para quedar en equilibrio." },
    calculator: { name: "Calculadora de punto de equilibrio", href: "/punto-de-equilibrio", copy: "Obtené las unidades y ventas necesarias usando tus costos y precios." },
    faqs: [
      { question: "¿El punto de equilibrio incluye ganancia?", answer: "No. En el equilibrio la ganancia es cero: solamente se cubren todos los costos." },
      { question: "¿Qué pasa si cambia el precio?", answer: "Cambia el aporte por unidad y, por lo tanto, la cantidad necesaria para llegar al equilibrio." },
    ],
  },
  {
    slug: "como-calcular-roi-inversion",
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
    eyebrow: "Recupero de capital",
    title: "Cómo saber cuándo recuperás una inversión",
    description: "Estimá cuántos meses necesitás para recuperar el capital invertido a partir del flujo neto esperado.",
    intro: "El período de recupero indica cuánto tarda el proyecto en devolver el capital inicial. Es fácil de entender, pero debe analizarse junto con rentabilidad y riesgo.",
    steps: [
      { title: "Determiná el capital inicial", copy: "Incluí todos los desembolsos necesarios para que la inversión empiece a funcionar." },
      { title: "Estimá el flujo neto", copy: "Usá el dinero que realmente queda por período después de costos operativos." },
      { title: "Calculá el plazo", copy: "Dividí la inversión inicial por el flujo neto mensual esperado." },
    ],
    example: { title: "Una máquina de $2.000.000", copy: "Si produce un flujo neto adicional de $500.000 mensuales y se mantiene estable, el recupero simple es:", result: "$2.000.000 ÷ $500.000 = 4 meses." },
    calculator: { name: "Calculadora de recupero de capital", href: "/recupero-capital", copy: "Probá diferentes inversiones, ingresos y plazos antes de comprometer el capital." },
    faqs: [
      { question: "¿El recupero considera intereses?", answer: "El recupero simple no descuenta el valor del dinero en el tiempo. Para análisis complejos se necesitan métricas adicionales." },
      { question: "¿Qué pasa con ingresos variables?", answer: "Conviene construir escenarios conservador, esperado y optimista en lugar de usar un solo promedio." },
    ],
  },
  {
    slug: "como-calcular-costo-hamburguesa",
    eyebrow: "Gastronomía",
    title: "Cómo calcular el costo real de una hamburguesa",
    description: "Incluí ingredientes, packaging, comisiones y gastos del negocio para conocer el costo y precio de una hamburguesa.",
    intro: "El costo no termina en la carne y el pan. Para definir un precio sostenible también tenés que contemplar merma, salsas, packaging, comisiones y la parte correspondiente de la operación.",
    steps: [
      { title: "Costeá cada ingrediente", copy: "Convertí el precio de compra a la cantidad realmente utilizada por hamburguesa." },
      { title: "Sumá packaging y venta", copy: "Agregá caja, papel, bolsa, comisión de la plataforma y costo de cobro." },
      { title: "Revisá operación y margen", copy: "Usá el volumen esperado para entender costos fijos y elegir un precio con margen suficiente." },
    ],
    example: { title: "No olvides la merma", copy: "Si comprás insumos que pierden peso o no se aprovechan por completo, el costo utilizable es mayor que el precio nominal.", result: "El precio debe calcularse sobre el costo real por unidad, no solamente sobre los ingredientes principales." },
    calculator: { name: "Calculadora para hamburgueserías", href: "/hamburgueseria", copy: "Calculá costo por hamburguesa, margen, precio recomendado y ganancia mensual." },
    faqs: [
      { question: "¿Incluyo el delivery?", answer: "Incluí toda comisión o costo de entrega que quede a cargo del negocio." },
      { question: "¿Cómo reparto alquiler y sueldos?", answer: "Son costos fijos mensuales. El volumen vendido determina cuánto debe aportar cada unidad para cubrirlos." },
    ],
  },
  {
    slug: "como-calcular-iva-mensual",
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
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
