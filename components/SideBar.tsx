"use client";

import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 border-r border-white/10 bg-zinc-950 p-6">
        <h2 className="text-sm font-semibold text-white/70 mb-4">
          CALCULADORAS
        </h2>

        <nav className="space-y-2">
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/5"
          >
            Margen / Break-even / ROI
          </Link>

          <Link
            href="/interes-compuesto"
            className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/5"
          >
            Interés compuesto
          </Link>
        </nav>
      </aside>

      {/* MOBILE BUTTON */}
      <div className="md:hidden border-b border-white/10 bg-zinc-950 px-4 py-3">
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black"
        >
          Calculadoras
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden border-b border-white/10 bg-zinc-950 px-4 pb-4">
          <nav className="space-y-2">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              Margen / Break-even / ROI
            </Link>

            <Link
              href="/interes-compuesto"
              className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              Interés compuesto
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}