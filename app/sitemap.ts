import type { MetadataRoute } from "next";
import { availableCalculators } from "@/app/calculadoras/catalog";
import { guides } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.calculadoraemprendedora.com";
  const contentUpdatedAt = new Date("2026-09-11T00:00:00-03:00");
  const homeUpdatedAt = new Date("2026-09-16T00:00:00-03:00");
  const calculatorRoutes = availableCalculators.map((calculator) => calculator.href);

  const routes = [
    "/",
    "/calculadoras",
    "/precios",
    "/contacto",
    ...calculatorRoutes,
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
    ...calculatorRoutes,
  ]);

  return [...new Set(routes)].map((route) => ({
    url: `${base}${route}`,
    lastModified: route === "/" ? homeUpdatedAt : updatedRoutes.has(route) ? contentUpdatedAt : undefined,
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
