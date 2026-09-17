import Link from "next/link";

export default function TrustSection() {
  return (
    <aside aria-label="Cómo revisar los cálculos" className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm leading-6 text-white/65">
      Calculá gratis y sin cuenta. Cada herramienta explica su fórmula y sus límites;
      podés revisar los ejemplos en nuestras{" "}
      <Link href="/guias" className="font-semibold text-emerald-200 underline underline-offset-4 hover:text-emerald-100">
        guías paso a paso
      </Link>.
    </aside>
  );
}
