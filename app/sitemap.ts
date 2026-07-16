import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.calculadoraemprendedora.com";

  const routes = [
    "/",
    "/calculadoras",
    "/precios",
    "/contacto",
    "/margen",
    "/markup",
    "/punto-de-equilibrio",
    "/roi",
    "/interes-compuesto",
    "/hamburgueseria",
    "/cafeteria",
    "/produccion",
    "/distribuidora",
    "/reventa",
    "/Intermediarios",
    "/aporte-mensual",
    "/roi-inversion",
    "/recupero-capital",
    "/meta-ahorro",
    "/rendimiento-real",
    "/terminos-y-condiciones",
    "/cancelaciones-y-reembolsos",
    "/politica-de-privacidad",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
  }));
}
