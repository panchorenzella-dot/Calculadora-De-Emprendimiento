import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.calculadoraemprendedora.com";
  const contentUpdatedAt = new Date("2026-09-11T00:00:00-03:00");

  const routes = [
    "/",
    "/calculadoras",
    "/precios",
    "/contacto",
    // Herramientas centrales del negocio
    "/markup",
    "/margen",
    "/punto-de-equilibrio",
    "/roi",
    // Inversión y ahorro
    "/interes-compuesto",
    "/aporte-mensual",
    "/roi-inversion",
    "/recupero-capital",
    "/meta-ahorro",
    "/rendimiento-real",
    // Impuestos y costos argentinos
    "/iva-mensual",
    "/iva-producto",
    "/ingresos-brutos",
    "/costo-laboral",
    // Calculadoras específicas por rubro
    "/reventa",
    "/produccion",
    "/distribuidora",
    "/intermediarios",
    "/cafeteria",
    "/hamburgueseria",
    "/guias",
    ...guides.map((guide) => `/guias/${guide.slug}`),
    "/terminos-y-condiciones",
    "/cancelaciones-y-reembolsos",
    "/politica-de-privacidad",
  ];

  const updatedRoutes = new Set([
    "/",
    "/calculadoras",
    "/guias",
    ...guides.map((guide) => `/guias/${guide.slug}`),
    "/markup",
    "/margen",
    "/punto-de-equilibrio",
    "/roi",
    "/interes-compuesto",
    "/aporte-mensual",
    "/roi-inversion",
    "/recupero-capital",
    "/meta-ahorro",
    "/rendimiento-real",
    "/iva-mensual",
    "/iva-producto",
    "/ingresos-brutos",
    "/costo-laboral",
    "/reventa",
    "/produccion",
    "/distribuidora",
    "/intermediarios",
    "/cafeteria",
    "/hamburgueseria",
  ]);

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: updatedRoutes.has(route) ? contentUpdatedAt : undefined,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority:
      route === "/"
        ? 1
        : route === "/calculadoras"
          ? 0.95
          : route === "/guias" || route.startsWith("/guias/")
            ? 0.85
            : 0.7,
  }));
}
