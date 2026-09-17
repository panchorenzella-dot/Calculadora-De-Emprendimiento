import Link from "next/link";
import { availableCalculators } from "@/app/calculadoras/catalog";
import { homeCalculatorGroups } from "@/lib/calculatorDiscovery";

export default function HomeCalculatorCatalog() {
  return (
    <section aria-labelledby="home-catalog-title" className="pt-8 sm:pt-10">
      <h2 id="home-catalog-title" className="text-2xl font-bold tracking-tight">Las {availableCalculators.length} calculadoras, por objetivo</h2>
      <p className="mt-2 text-sm leading-6 text-white/65">Abrí una categoría y elegí tu próximo cálculo sin salir de esta página.</p>
      <div className="mt-5 grid items-start gap-3 sm:grid-cols-2">
        {homeCalculatorGroups.map((group) => (
          <details key={group.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <summary className="cursor-pointer text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-200">
              {group.title} <span className="ml-2 text-xs font-medium text-emerald-200/75">{group.calculators.length} herramientas</span>
            </summary>
            <ul className="mt-4 grid gap-3 border-t border-white/10 pt-4">
              {group.calculators.map((calculator) => (
                <li key={calculator.href}><Link href={calculator.href} className="block rounded-xl p-2 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-emerald-200">{calculator.title} <span aria-hidden="true">→</span></Link></li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
