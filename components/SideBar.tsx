"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const item = (href: string) =>
    `block rounded-lg px-3 py-2 text-sm transition ${
      pathname === href
        ? "bg-white/10 text-white"
        : "text-white/70 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 px-3 py-4">
      <div className="mb-3 text-xs font-semibold text-white/50 uppercase tracking-wide">
        Calculadoras
      </div>

      <nav className="flex flex-col gap-1">
        <Link href="/" className={item("/")}>
           Margen / Break-even / ROI
        </Link>

        <Link href="/interes-compuesto" className={item("/interes-compuesto")}>
           Interés compuesto
        </Link>
      </nav>
    </aside>
  );
}