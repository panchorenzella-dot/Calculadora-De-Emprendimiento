export type Guide = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  steps: Array<{ title: string; copy: string }>;
  example: { title: string; copy: string; result: string };
  calculator: { name: string; href: string; copy: string };
  faqs: Array<{ question: string; answer: string }>;
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
    example: { title: "Inversión de $1.000.000", copy: "Si el valor final es $1.250.000, el beneficio es $250.000.", result: "$250.000 ÷ $1.000.000 × 100 = ROI del 25%." },
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
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

