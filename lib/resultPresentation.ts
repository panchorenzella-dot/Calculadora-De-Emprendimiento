import { parseLocaleNumber } from "./numberInput";

export function resultPresentation(title: string, value: string) {
  const financial = /ganancia|pérdida|margen|markup|rentabilidad|rendimiento|inter[eé]s(?:es)? (?:ganado|generado)|roi|resultado neto/i.test(title);
  const number = parseLocaleNumber(value.replace(/[^\d.,()−-]/g, "").replace(/−/g, "-"));
  const numeric = /\d/.test(value) && !/no calculable|no rentable/i.test(value);
  const tone = financial && numeric ? number > 0 ? "positive" : number < 0 ? "negative" : "neutral" : "neutral";
  return { tone, title: tone === "negative" ? title.replace(/ganancia/gi, "Pérdida") : title };
}
