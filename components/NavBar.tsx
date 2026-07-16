"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/calculadoras", label: "Calculadoras" },
    { href: "/precios", label: "Planes" },
    { href: "/perfil", label: "Perfil" },
    { href: "/contacto", label: "Contacto" },
  ];

  const linkClass = (href: string) =>
    `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
      pathname === href
        ? "bg-white/10 text-white"
        : "text-white/65 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <header className="border-b border-white/10 bg-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Calculadora Emprendedora" className="shrink-0 font-semibold tracking-tight text-white">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-emerald-200/15 bg-emerald-200/[0.06] text-xs text-emerald-100 sm:hidden">CE</span>
            <span className="hidden text-base sm:inline">Calculadora Emprendedora</span>
          </Link>

          <nav
            aria-label="Navegacion principal"
            className="flex shrink-0 gap-1"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${linkClass(link.href)} ${link.href === "/" ? "hidden sm:inline-flex" : ""} ${link.href === "/contacto" ? "hidden lg:inline-flex" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
      </div>
    </header>
  );
}
