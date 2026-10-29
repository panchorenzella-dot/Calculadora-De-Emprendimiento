"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { hasStoredSession } from "@/lib/authBrowserSession";

export default function Navbar() {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const updateSession = () => setSignedIn(hasStoredSession());
    updateSession();
    window.addEventListener("storage", updateSession);
    window.addEventListener("calculator-auth-changed", updateSession);
    return () => {
      window.removeEventListener("storage", updateSession);
      window.removeEventListener("calculator-auth-changed", updateSession);
    };
  }, [pathname]);

  const links = [
    { href: "/", label: "Inicio", visibility: "hidden sm:inline-flex" },
    { href: "/calculadoras", label: "Calculadoras", visibility: "inline-flex" },
    { href: "/precios", label: "Planes", visibility: "inline-flex" },
    { href: "/contacto", label: "Contacto", visibility: "hidden lg:inline-flex" },
  ];

  const linkClass = (href: string) =>
    `relative whitespace-nowrap px-2.5 py-2 text-sm font-medium transition ${
      pathname === href
        ? "text-white after:absolute after:inset-x-2.5 after:-bottom-[13px] after:h-px after:bg-emerald-200/80"
        : "text-white/55 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#070907]/90 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="CE, Calculadora Emprendedora, un producto de Growtella" className="shrink-0 font-semibold tracking-[-0.02em] text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/12 bg-white/[0.025] text-[11px] text-white sm:hidden">CE</span>
          <span className="hidden sm:flex sm:flex-col">
            <span className="text-sm leading-tight">Calculadora Emprendedora</span>
            <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.2em] text-white/35">por Growtella</span>
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="flex shrink-0 items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`${linkClass(link.href)} ${link.visibility}`}>
              {link.label}
            </Link>
          ))}

          {signedIn ? (
            <Link prefetch={false} href="/perfil" aria-current={pathname.startsWith("/perfil") ? "page" : undefined} className={linkClass("/perfil")}>Perfil</Link>
          ) : (
            <Link prefetch={false} href="/perfil" className="action-positive ml-1 inline-flex whitespace-nowrap rounded-lg border border-white/12 bg-white/[0.035] px-3.5 py-2 text-sm font-semibold text-white/85 transition hover:border-white/22 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/60">
              <span className="sm:hidden">Entrar</span>
              <span className="hidden sm:inline">Ingresar</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
