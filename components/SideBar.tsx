"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string };

export default function SideBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items: NavItem[] = useMemo(
    () => [
      { label: "Margen / Rentabilidad", href: "/" },
      { label: "Interés compuesto", href: "/interes-compuesto" },
    ],
    []
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const NavList = ({ onPick }: { onPick?: () => void }) => (
    <nav className="space-y-2">
      {items.map((it) => {
        const active = isActive(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={onPick}
            className={[
              "block rounded-xl px-3 py-2 text-sm transition",
              active
                ? "bg-white/10 text-white ring-1 ring-white/20"
                : "text-white/70 hover:bg-white/5 hover:text-white",
            ].join(" ")}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* DESKTOP */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-white/10 bg-zinc-950 px-4 py-6">
        <div className="mb-4 text-sm font-semibold text-white/80">
          Calculadoras
        </div>
        <NavList />
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden w-full border-b border-white/10 bg-zinc-950 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white/80">
            Calculadoras
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950"
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            Cambiar
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          {/* backdrop */}
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
          />

          {/* panel */}
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm border-l border-white/10 bg-zinc-950 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-white/80">
                Elegí una calculadora
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950"
              >
                Cerrar
              </button>
            </div>

            <NavList onPick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}