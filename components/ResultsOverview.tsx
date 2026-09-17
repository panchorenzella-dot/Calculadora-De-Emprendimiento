import type { ReactNode } from "react";

/** Keep the complete breakdown mounted so saved scenarios include every metric. */
export default function ResultsOverview({ primary, children }: { primary: ReactNode; children: ReactNode }) {
  return (
    <div className="mt-5 min-w-0 space-y-4">
      <div data-primary-results className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 [&>:first-child]:sm:col-span-2">
        {primary}
      </div>
      <details data-results-breakdown className="group min-w-0 rounded-2xl border border-white/10 bg-black/15 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-200">
          <span className="group-open:hidden">Ver desglose</span>
          <span className="hidden group-open:inline">Ocultar desglose</span>
        </summary>
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          {children}
        </div>
      </details>
    </div>
  );
}
