import type { ReactNode } from "react";

export default function OptionalFields({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details data-optional-fields className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-200">
        {title}
      </summary>
      <div className="mt-4 grid gap-4">{children}</div>
      <p className="mt-3 text-xs leading-5 text-white/60">Los valores cargados se incluyen en el cálculo aunque cierres esta sección.</p>
    </details>
  );
}
