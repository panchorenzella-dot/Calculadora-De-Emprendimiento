export type Calculator = {
  title: string;
  description: string;
  idealFor: string;
  href: string;
  tags: string[];
  comingSoon?: boolean;
};

export type CalculatorSection = {
  id: string;
  title: string;
  description: string;
  calculators: Calculator[];
};

/**
 * The directory is intentionally ordered by decision value: first the
 * day-to-day economics of a business, then investing, taxes and finally
 * calculators for narrower business models.
 */
export const calculatorSections: CalculatorSection[] = [
  {
    id: "business",
    title: "Precios, costos y rentabilidad",
    description:
      "Las herramientas esenciales para definir precios, cuidar el margen y saber cuánto tiene que vender tu negocio.",
    calculators: [
      {
        title: "Precio de venta",
        description:
          "Definí cuánto cobrar según tus costos, el margen deseado y la rentabilidad esperada.",
        idealFor: "Productos, servicios y emprendimientos",
        href: "/markup",
        tags: ["precio", "venta", "markup", "margen", "rentabilidad"],
      },
      {
        title: "Margen de ganancia",
        description:
          "Calculá si tu producto deja ganancia real después de costos, ventas e inversión.",
        idealFor: "Comercios, reventa, gastronomía y servicios",
        href: "/margen",
        tags: ["margen", "ganancia", "rentabilidad", "precio"],
      },
      {
        title: "Punto de equilibrio",
        description:
          "Descubrí cuántas unidades necesitás vender para cubrir todos tus costos.",
        idealFor: "Negocios con costos fijos y variables",
        href: "/punto-de-equilibrio",
        tags: ["punto de equilibrio", "costos", "ventas", "unidades"],
      },
      {
        title: "ROI del negocio",
        description:
          "Medí el retorno de una inversión dentro de tu negocio o de una compra importante.",
        idealFor: "Negocios, proyectos y decisiones de capital",
        href: "/roi",
        tags: ["roi", "negocio", "retorno", "rentabilidad"],
      },
      {
        title: "Recupero de inversión del negocio",
        description:
          "Estimá en cuánto tiempo se recupera una inversión dentro de un negocio.",
        idealFor: "Emprendedores que quieren medir recupero operativo",
        href: "",
        tags: ["recupero", "inversión", "capital", "negocio"],
        comingSoon: true,
      },
      {
        title: "Costo unitario",
        description:
          "Calculá cuánto te cuesta producir o comprar cada unidad de tu producto.",
        idealFor: "Producción, reventa y gastronomía",
        href: "",
        tags: ["costo", "unitario", "producto", "producción"],
        comingSoon: true,
      },
      {
        title: "Ganancia mensual",
        description:
          "Estimá cuánto podés ganar por mes según ventas, costos y gastos fijos.",
        idealFor: "Negocios chicos y emprendimientos",
        href: "",
        tags: ["ganancia", "mensual", "ventas", "costos"],
        comingSoon: true,
      },
    ],
  },
  {
    id: "investment",
    title: "Inversión y ahorro",
    description:
      "Herramientas para evaluar retornos, proyectar el crecimiento del capital y planificar objetivos de ahorro.",
    calculators: [
      {
        title: "ROI de inversión",
        description:
          "Medí cuánto rinde una inversión comparando el capital inicial con el resultado final.",
        idealFor: "Inversiones personales y proyectos",
        href: "/roi-inversion",
        tags: ["roi", "inversión", "retorno", "capital"],
      },
      {
        title: "Interés compuesto",
        description:
          "Proyectá el crecimiento de tu plata con aportes mensuales e interés compuesto.",
        idealFor: "Ahorro, inversión y planificación financiera",
        href: "/interes-compuesto",
        tags: ["interés compuesto", "inversión", "ahorro", "capital"],
      },
      {
        title: "Inversión con aporte mensual",
        description:
          "Calculá cuánto podés juntar invirtiendo todos los meses.",
        idealFor: "Planificar inversiones mensuales en pesos o dólares",
        href: "/aporte-mensual",
        tags: ["ahorro", "mensual", "aporte", "inversión"],
      },
      {
        title: "Recupero de capital",
        description:
          "Calculá cuánto tardás en recuperar el dinero invertido en un activo o proyecto.",
        idealFor: "Inversores y emprendedores",
        href: "/recupero-capital",
        tags: ["recupero", "capital", "inversión", "retorno"],
      },
      {
        title: "Meta de ahorro",
        description:
          "Calculá cuánto necesitás ahorrar por mes para llegar a una meta.",
        idealFor: "Planificar una meta de ahorro",
        href: "/meta-ahorro",
        tags: ["ahorro", "mensual", "meta", "inversión"],
      },
      {
        title: "Rendimiento real",
        description:
          "Calculá si realmente ganaste después de descontar la inflación.",
        idealFor: "Medir el poder de compra de una inversión",
        href: "/rendimiento-real",
        tags: ["rendimiento", "inflación", "inversión", "ahorro"],
      },
    ],
  },
  {
    id: "taxes",
    title: "Impuestos y costos en Argentina",
    description:
      "Estimaciones para ordenar IVA, Ingresos Brutos y el costo total de incorporar personal.",
    calculators: [
      {
        title: "IVA mensual a pagar",
        description:
          "Estimá débito fiscal, crédito fiscal, saldos a favor y el IVA del mes.",
        idealFor: "Responsables inscriptos y administración de negocios",
        href: "/iva-mensual",
        tags: ["iva", "mensual", "impuestos", "arca", "débito", "crédito"],
      },
      {
        title: "IVA por producto",
        description:
          "Agregá IVA a un precio o separá el impuesto incluido en el total.",
        idealFor: "Precios, presupuestos, productos y servicios",
        href: "/iva-producto",
        tags: ["iva", "producto", "precio", "impuestos", "factura"],
      },
      {
        title: "Ingresos Brutos",
        description:
          "Estimá el anticipo local con alícuota, retenciones y percepciones.",
        idealFor: "Contribuyentes locales de una jurisdicción",
        href: "/ingresos-brutos",
        tags: ["iibb", "ingresos brutos", "provincia", "impuestos", "sircreb"],
      },
      {
        title: "Costo laboral",
        description:
          "Calculá sueldo bruto, cargas patronales, ART y costo completo.",
        idealFor: "Empleadores y planificación de nuevas contrataciones",
        href: "/costo-laboral",
        tags: ["empleado", "sueldo", "cargas sociales", "art", "aguinaldo"],
      },
    ],
  },
  {
    id: "industries",
    title: "Calculadoras por tipo de negocio",
    description:
      "Herramientas específicas para rubros que necesitan contemplar costos y variables propias de su operación.",
    calculators: [
      {
        title: "Compra y venta",
        description:
          "Calculá precio final, margen, comisiones, envíos y ganancia real.",
        idealFor: "Tiendas online, reventa y emprendimientos de ropa",
        href: "/reventa",
        tags: ["ropa", "reventa", "tienda", "comisiones"],
      },
      {
        title: "Fábrica y producción",
        description:
          "Calculá costo por unidad, ganancia, margen y punto de equilibrio.",
        idealFor: "Panaderías, producción de alimentos y fabricación",
        href: "/produccion",
        tags: ["panadería", "producción", "costos", "precio"],
      },
      {
        title: "Distribuidoras",
        description:
          "Calculá margen por caja, costo de reparto, ganancia por cliente y stock necesario.",
        idealFor: "Distribuidores y vendedores mayoristas",
        href: "/distribuidora",
        tags: ["distribuidora", "stock", "reparto", "clientes"],
      },
      {
        title: "Intermediarios y comisiones",
        description:
          "Calculá comisiones, ganancia mensual, punto de equilibrio, recupero y ROI.",
        idealFor: "Vendedores a comisión, brokers e intermediarios comerciales",
        href: "/intermediarios",
        tags: ["comisiones", "pedidos", "intermediarios", "ventas"],
      },
      {
        title: "Cafeterías",
        description:
          "Estimá costos, ticket promedio, margen por venta y punto de equilibrio.",
        idealFor: "Cafeterías, bares y locales gastronómicos",
        href: "/cafeteria",
        tags: ["cafetería", "gastronomía", "café", "ticket", "margen"],
      },
      {
        title: "Hamburgueserías",
        description:
          "Calculá costos por hamburguesa, margen, precio recomendado y ganancia mensual.",
        idealFor: "Hamburgueserías, dark kitchens y locales de comida",
        href: "/hamburgueseria",
        tags: ["hamburguesería", "gastronomía", "comida", "delivery", "margen"],
      },
    ],
  },
];

export const availableCalculators = calculatorSections.flatMap((section) =>
  section.calculators.filter((calculator) => !calculator.comingSoon),
);
