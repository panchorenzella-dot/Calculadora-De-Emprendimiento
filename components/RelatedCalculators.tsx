import Link from "next/link";
import { getRelatedCalculators } from "@/lib/calculatorDiscovery";

export default function RelatedCalculators({ path }: { path: string }) {
  const calculators = getRelatedCalculators(path);
  if (!calculators.length) return null;
  return (
    <section aria-labelledby="related-calculators-title" className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
      <h2 id="related-calculators-title" className="text-2xl font-bold tracking-tight">Seguí con estos cálculos</h2>
      <p className="mt-2 text-sm leading-6 text-white/65">{path === "/punto-de-equilibrio" ? "Ya conocés tu piso de ventas. Evaluá el retorno y cuánto tardarías en recuperar una inversión." : "Completá la decisión con otras herramientas relacionadas. También podés usarlas sin registrarte."}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {calculators.map((calculator) => (
          <Link key={calculator.href} href={calculator.href} className="group flex flex-col rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-emerald-300/30">
            <h3 className="font-bold text-emerald-200/90">{calculator.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">{calculator.description}</p>
            <span className="mt-auto pt-4 text-sm font-bold text-white group-hover:text-emerald-200">Calcular ahora →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
