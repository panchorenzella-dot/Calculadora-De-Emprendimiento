import Link from "next/link";

import { calculatorSections } from "@/app/calculadoras/catalog";
import { guides, type GuideTopic } from "@/lib/guides";

export default function CalculatorGuideLinks({ path }: { path: string }) {
  const section = calculatorSections.find((candidate) =>
    candidate.calculators.some(
      (calculator) => !calculator.comingSoon && calculator.href === path,
    ),
  );
  if (!section) return null;

  const topic = section.id as GuideTopic;
  const directGuides = guides.filter((guide) => guide.calculator.href === path);
  const relatedGuides = guides.filter(
    (guide) =>
      guide.topic === topic &&
      !directGuides.some((directGuide) => directGuide.slug === guide.slug),
  );
  const visibleGuides = [...directGuides, ...relatedGuides].slice(0, 3);

  if (!visibleGuides.length) return null;

  return (
    <aside
      aria-labelledby={`calculator-guides-${path.slice(1)}`}
      className="mt-10 rounded-3xl border border-white/[0.08] bg-[#080b09] p-6 sm:p-8"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/75">
          Entendé el cálculo
        </p>
        <h2
          id={`calculator-guides-${path.slice(1)}`}
          className="mt-3 text-2xl font-bold tracking-tight"
        >
          Guías para usar mejor este resultado
        </h2>
        <p className="mt-3 text-sm leading-7 text-white/65">
          Revisá la fórmula, un ejemplo completo y los errores que más cambian el
          resultado antes de tomar una decisión.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {visibleGuides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guias/${guide.slug}`}
            className="group rounded-2xl border border-white/[0.08] bg-black/25 p-4 transition hover:border-emerald-300/25"
          >
            <span className="text-sm font-bold leading-6 text-white/90">
              {guide.title}
            </span>
            <span className="mt-3 block text-xs font-bold text-emerald-100 group-hover:text-white">
              Ver fórmula y ejemplo →
            </span>
          </Link>
        ))}
      </div>

      <Link href="/guias" className="mt-6 inline-flex text-sm font-bold text-white/75 hover:text-white">
        Explorar las {guides.length} guías →
      </Link>
    </aside>
  );
}
