"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  const links = [
    { href: "/", label: "Inicio", visibility: "hidden sm:inline-flex" },
    { href: "/calculadoras", label: "Calculadoras", visibility: "inline-flex" },
    { href: "/precios", label: "Planes", visibility: "inline-flex" },
    { href: "/contacto", label: "Contacto", visibility: "hidden lg:inline-flex" },
  ];

  const linkClass = (href: string) =>
    `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold transition ${
      pathname === href
        ? "bg-white/10 text-white"
        : "text-white/70 hover:bg-white/[0.06] hover:text-white"
    }`;

  return (
    <header className="border-b border-white/10 bg-[#050605]">
      {!signedIn && pathname !== "/perfil" && (
        <div className="border-b border-white/10 bg-[#0a0b0a] text-white">
          <div className="mx-auto flex min-h-9 max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-bold sm:text-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" aria-hidden="true" />
            <span className="sm:hidden">Guardá tus cálculos gratis.</span>
            <span className="hidden sm:inline">Creá tu cuenta gratis, guardá tus escenarios y continuá desde cualquier dispositivo.</span>
            <Link href="/perfil?modo=registro" className="shrink-0 font-black text-green-500 hover:text-green-400">
              Registrarme →
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Calculadora Emprendedora, un producto de Growtella" className="shrink-0 font-black tracking-tight text-white">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/[0.05] text-xs text-white sm:hidden">CE</span>
          <span className="hidden sm:flex sm:flex-col">
            <span className="text-base leading-tight">Calculadora Emprendedora</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">Originado por Growtella</span>
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="flex shrink-0 items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`${linkClass(link.href)} ${link.visibility}`}>
              {link.label}
            </Link>
          ))}

          {signedIn ? (
            <Link href="/perfil" className={linkClass("/perfil")}>Perfil</Link>
          ) : (
            <Link href="/perfil?modo=registro" className="ml-1 inline-flex whitespace-nowrap rounded-full bg-green-700 px-3.5 py-2 text-sm font-black text-white transition hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
              <span className="sm:hidden">Registro</span>
              <span className="hidden sm:inline">Crear cuenta</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
