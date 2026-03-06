"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition ${
      pathname === href
        ? "bg-white text-zinc-900"
        : "bg-white/10 text-white hover:bg-white/20"
    }`;

  return (
    <header className="border-b border-white/10 bg-zinc-950/60 backdrop-blur">
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            Calculadora Emprendedora
          </Link>

          <nav className="flex gap-2">
            <Link href="/" className={linkClass("/")}>
              Margen
            </Link>
            <Link
              href="/interes-compuesto"
              className={linkClass("/interes-compuesto")}
            >
              Interés compuesto
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}