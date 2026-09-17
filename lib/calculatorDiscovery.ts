import { availableCalculators, calculatorSections } from "../app/calculadoras/catalog";

export const homeCalculatorGroups = [
  { id: "prices", title: "Precios y márgenes", paths: ["/markup", "/margen"] },
  { id: "costs", title: "Costos y punto de equilibrio", paths: ["/punto-de-equilibrio", "/roi", "/costo-laboral"] },
  { id: "taxes", title: "Impuestos", paths: ["/iva-producto", "/iva-mensual", "/ingresos-brutos"] },
  { id: "investment", title: "Inversión y ahorro", paths: calculatorSections.find((section) => section.id === "investment")!.calculators.filter((calculator) => !calculator.comingSoon).map((calculator) => calculator.href) },
  { id: "industries", title: "Calculadoras para tu rubro", paths: calculatorSections.find((section) => section.id === "industries")!.calculators.filter((calculator) => !calculator.comingSoon).map((calculator) => calculator.href) },
].map((group) => ({
  id: group.id,
  title: group.title,
  calculators: group.paths.map((path) => availableCalculators.find((calculator) => calculator.href === path)).filter((calculator) => calculator !== undefined),
}));

const relatedPaths: Record<string, string[]> = {
  "/markup": ["/margen", "/iva-producto", "/punto-de-equilibrio"],
  "/margen": ["/markup", "/punto-de-equilibrio", "/roi"],
  "/punto-de-equilibrio": ["/margen", "/recupero-capital", "/roi-inversion"],
  "/roi": ["/recupero-capital", "/punto-de-equilibrio", "/roi-inversion"],
  "/costo-laboral": ["/punto-de-equilibrio", "/markup", "/margen"],
};

export function getRelatedCalculators(path: string) {
  const group = homeCalculatorGroups.find((candidate) => candidate.calculators.some((calculator) => calculator.href === path));
  if (!group) return [];
  const paths = relatedPaths[path] ?? (group.id === "industries"
    ? ["/markup", "/margen", "/punto-de-equilibrio"]
    : group.calculators.map((calculator) => calculator.href));
  return paths.filter((candidate) => candidate !== path)
    .map((candidate) => availableCalculators.find((calculator) => calculator.href === candidate))
    .filter((calculator) => calculator !== undefined).slice(0, 3);
}
