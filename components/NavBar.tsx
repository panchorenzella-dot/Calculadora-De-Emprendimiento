import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="flex w-full items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">

          <div className="leading-tight">
            <Link href="/" className="text-sm font-semibold hover:text-white">
              Calculadora Emprendedora
            </Link>
            <div className="text-xs text-white/60">
              
            </div>
          </div>
        </div>

        <div className="text-xs text-white/60"></div>
      </div>
    </header>
  );
}