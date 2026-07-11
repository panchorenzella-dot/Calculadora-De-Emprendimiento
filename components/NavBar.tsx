"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/calculadoras", label: "Calculadoras" },
    { href: "/perfil", label: "Perfil" },
    { href: "/contacto", label: "Contacto" },
  ];

  const linkClass = (href: string) =>
    `whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
      pathname === href
        ? "bg-white/10 text-white"
        : "text-white/65 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <header className="border-b border-white/10 bg-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="min-w-0 truncate text-sm font-semibold tracking-tight text-white sm:text-base">
            Calculadora Emprendedora
          </Link>

          <nav
            aria-label="Navegacion principal"
            className="flex shrink-0 gap-1"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${linkClass(link.href)} ${link.href === "/contacto" ? "hidden md:inline-flex" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
      </div>
    </header>
  );
}
