"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `text-lg font-semibold transition ${
      pathname === href
        ? "text-white"
        : "text-white/70 hover:text-white"
    }`;

  return (
    <header className="border-b border-white/10 bg-zinc-950/60 backdrop-blur">
      <div className="relative flex items-center px-6 py-4">

        {/* Logo izquierda */}
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Calculadora Emprendedora
        </Link>

        {/* Links centro */}
        <nav className="absolute left-1/2 flex -translate-x-1/2 gap-10">
          <Link href="/calculadoras" className={linkClass("/calculadoras")}>
            Inicio
          </Link>

          <Link href="/contacto" className={linkClass("/contacto")}>
            Contacto
          </Link>

          <Link
            href="/politica-de-privacidad"
            className={linkClass("/politica-privacidad")}
          >
            Política de privacidad
          </Link>
        </nav>

      </div>
    </header>
  );
}