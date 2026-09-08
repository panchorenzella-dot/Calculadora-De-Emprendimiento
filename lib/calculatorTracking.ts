export const calculatorTracking: Record<
  string,
  { type: string; name: string }
> = {
  "/margen": { type: "margen", name: "Margen de ganancia" },
  "/markup": { type: "precio-venta", name: "Precio de venta" },
  "/roi": { type: "roi", name: "ROI" },
  "/punto-de-equilibrio": {
    type: "punto-de-equilibrio",
    name: "Punto de equilibrio",
  },
  "/interes-compuesto": {
    type: "interes-compuesto",
    name: "Interés compuesto",
  },
  "/aporte-mensual": { type: "aporte-mensual", name: "Aporte mensual" },
  "/cafeteria": { type: "cafeteria", name: "Cafetería" },
  "/distribuidora": { type: "distribuidora", name: "Distribuidora" },
  "/hamburgueseria": { type: "hamburgueseria", name: "Hamburguesería" },
  "/intermediarios": { type: "intermediarios", name: "Intermediarios" },
  "/meta-ahorro": { type: "meta-ahorro", name: "Meta de ahorro" },
  "/produccion": { type: "produccion", name: "Producción" },
  "/recupero-capital": {
    type: "recupero-capital",
    name: "Recupero de capital",
  },
  "/rendimiento-real": {
    type: "rendimiento-real",
    name: "Rendimiento real",
  },
  "/reventa": { type: "reventa", name: "Compra y venta" },
  "/roi-inversion": { type: "roi-inversion", name: "ROI de inversión" },
  "/iva-mensual": { type: "iva-mensual", name: "IVA mensual" },
  "/iva-producto": { type: "iva-producto", name: "IVA por producto" },
  "/ingresos-brutos": { type: "ingresos-brutos", name: "Ingresos Brutos" },
  "/costo-laboral": { type: "costo-laboral", name: "Costo laboral" },
};

