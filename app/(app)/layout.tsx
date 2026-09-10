import CalculatorEnhancementsLoader from "@/components/CalculatorEnhancementsLoader";
import CalculatorTemplates from "@/components/CalculatorTemplates";

// Calculator markup and formulas ship with the deployment, so Next can keep
// these routes statically generated instead of scheduling needless ISR writes.
export const revalidate = false;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="calculator-theme min-h-screen bg-zinc-950 text-white">
      <div className="calculator-page-shell mx-auto w-full max-w-5xl px-4 pb-10 pt-6">
        {children}
        <CalculatorTemplates />
        <CalculatorEnhancementsLoader />
      </div>
    </main>
  );
}
