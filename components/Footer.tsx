import Link from "next/link";
import { ecosystemTools, socialLinks } from "@/lib/ecosystem";

const links = [
  ["/guias", "Guías"],
  ["/precios", "Planes"],
  ["/perfil", "Perfil"],
  ["/terminos-y-condiciones", "Términos"],
  ["/cancelaciones-y-reembolsos", "Cancelaciones"],
  ["/politica-de-privacidad", "Privacidad"],
  ["/contacto", "Contacto"],
];

export default function Footer() {
  const growtellaUrl = ecosystemTools[0].href;

  return (
    <footer className="border-t border-white/10 px-6 py-7 text-xs text-white/55 print:hidden">
      <div className="mx-auto mb-7 max-w-6xl border-b border-white/10 pb-7">
        <p className="text-sm font-semibold text-white/85">Seguinos en redes</p>
        <p className="mt-2 text-sm leading-6 text-white/55">Ideas, negocios y finanzas con Growtella.</p>
        <nav aria-label="Redes sociales de Growtella" className="mt-4 flex flex-wrap gap-3">
          {socialLinks.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${social.name}, ${social.handle} (se abre en una nueva pestaña)`}
              className="inline-flex min-h-11 items-center gap-3 rounded-full border border-white/15 bg-white/[0.035] px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:border-emerald-300/35 hover:text-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-200"
            >
              {social.name} <span aria-hidden="true" className="text-emerald-200/70">↗</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p>© {new Date().getFullYear()} Calculadora Emprendedora</p>
          <a href={growtellaUrl} className="mt-1 inline-flex font-medium text-emerald-200/55 transition hover:text-emerald-100">Originado por Growtella →</a>
        </div>
        <nav aria-label="Enlaces legales y de ayuda" className="flex flex-wrap gap-x-4 gap-y-3">
          {links.map(([href, label]) => (
            <Link key={href} prefetch={href === "/perfil" ? false : undefined} className="transition hover:text-white" href={href}>{label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
