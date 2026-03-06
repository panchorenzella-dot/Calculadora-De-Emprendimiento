"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const active = (path: string) =>
    pathname === path
      ? "bg-white text-zinc-900"
      : "bg-white/10 text-white hover:bg-white/20";

  return (
    <header className="border-b border-white/10 bg-zinc-950/60 backdrop-blur px-6 py-4">
      <div className="mx-auto max-w-5xl flex items-center justify-between">

        <Link href="/" className="font-semibold tracking-tight">
          Calculadora Emprendedora
        </Link>

        <div className="flex gap-2 text-sm font-semibold">
          <Link
            href="/"
            className={`px-4 py-2 rounded-xl ${active("/")}`}
          >
            Margen
          </Link>

          <Link
            href="/interes-compuesto"
            className={`px-4 py-2 rounded-xl ${active("/interes-compuesto")}`}
          >
            Interés compuesto
          </Link>
        </div>

      </div>
    </header>
  );
}