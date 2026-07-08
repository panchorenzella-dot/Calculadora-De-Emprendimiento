"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/calculadoras", label: "Calculadoras" },
    { href: "/contacto", label: "Contacto" },
  ];

  const linkClass = (href: string) =>
    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
      pathname === href || (href === "/" && pathname === "/calculadoras")
        ? "bg-white/10 text-white"
        : "text-white/65 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/85 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 shadow-lg shadow-black/20 sm:px-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Calculadora Emprendedora
            </p>

            <div className="mt-1">
              <p className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                Las mejores calculadoras para emprendedores
              </p>

              <p className="mt-1 max-w-2xl text-sm leading-5 text-white/55">
                Herramientas simples para calcular precios, ganancias,
                inversion y rentabilidad.
              </p>
            </div>
          </Link>

          <nav
            aria-label="Navegacion principal"
            className="-mx-1 flex max-w-full gap-2 overflow-x-auto pb-1 md:mx-0 md:shrink-0 md:overflow-visible md:pb-0"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
