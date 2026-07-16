import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  updated?: string;
  children: ReactNode;
};

export function LegalPageShell({ eyebrow, title, description, updated, children }: Props) {
  return (
    <main className="min-h-screen bg-[#080a09] text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.13),transparent_44%)]">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/75">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl leading-7 text-white/60">{description}</p>
          {updated && <p className="mt-5 text-xs text-white/35">Última actualización: {updated}</p>}
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-6 py-14">{children}</div>
    </main>
  );
}

export function LegalSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-[3rem_1fr]">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/10 text-sm font-bold text-emerald-300">{number}</span>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="mt-3 space-y-3 text-sm leading-7 text-white/58">{children}</div>
      </div>
    </section>
  );
}
