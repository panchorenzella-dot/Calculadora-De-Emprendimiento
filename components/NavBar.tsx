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
    `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
      pathname === href
        ? "bg-emerald-200/[0.12] text-emerald-50"
        : "text-emerald-50/65 hover:bg-emerald-200/[0.07] hover:text-emerald-50"
    }`;

  return (
    <header className="border-b border-emerald-200/15 bg-[#030a07]">
      {!signedIn && pathname !== "/perfil" && (
        <div className="border-b border-emerald-200/15 bg-emerald-300 text-[#043222]">
          <div className="mx-auto flex min-h-9 max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-semibold sm:text-sm">
            <span className="sm:hidden">Guardá tus cálculos gratis.</span>
            <span className="hidden sm:inline">Creá tu cuenta gratis, guardá tus escenarios y continuá desde cualquier dispositivo.</span>
            <Link href="/perfil?modo=registro" className="shrink-0 font-black underline decoration-[#043222]/35 underline-offset-2 hover:decoration-[#043222]">
              Registrarme →
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Calculadora Emprendedora, un producto de Growtella" className="shrink-0 font-semibold tracking-tight text-white">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-emerald-200/20 bg-emerald-200/[0.08] text-xs text-emerald-100 sm:hidden">CE</span>
          <span className="hidden sm:flex sm:flex-col">
            <span className="text-base leading-tight">Calculadora Emprendedora</span>
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-emerald-100/40">Originado por Growtella</span>
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
            <Link href="/perfil?modo=registro" className="ml-1 inline-flex whitespace-nowrap rounded-full bg-emerald-300 px-3.5 py-2 text-sm font-black text-[#043222] transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100">
              <span className="sm:hidden">Registro</span>
              <span className="hidden sm:inline">Crear cuenta</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
