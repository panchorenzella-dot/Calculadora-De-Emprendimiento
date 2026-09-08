import CalculatorEnhancementsLoader from "@/components/CalculatorEnhancementsLoader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="calculator-theme min-h-screen bg-zinc-950 text-white">
      <div className="calculator-page-shell mx-auto w-full max-w-5xl px-4 pb-10 pt-6">
        {children}
        <CalculatorEnhancementsLoader />
      </div>
    </main>
  );
}
