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

function SocialIcon({ platform }: { platform: string }) {
  if (platform === "instagram") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5 shrink-0 text-white transition group-hover:text-pink-300 group-focus-visible:text-pink-300">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0 text-white transition group-hover:text-cyan-200 group-focus-visible:text-cyan-200">
      <path d="M16.6 2h-3.5v13.8a3 3 0 1 1-2.6-3V9.3a6.5 6.5 0 1 0 6.1 6.5V8.9a9 9 0 0 0 5.4 1.8V7.2A5.4 5.4 0 0 1 16.6 2Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-5 text-xs text-white/55 print:hidden">
      <div className="mx-auto mb-5 flex max-w-6xl flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-200">Seguinos en redes</p>
          <p className="mt-1 text-xs leading-5 text-white/70">Ideas, negocios y finanzas con Growtella.</p>
        </div>
        <nav aria-label="Redes sociales de Growtella" className="flex flex-wrap gap-2.5">
          {socialLinks.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${social.name}, ${social.handle} (se abre en una nueva pestaña)`}
              className={`group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/25 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-200 ${
                social.platform === "instagram"
                  ? "hover:border-pink-400/70 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 focus-visible:border-pink-400/70 focus-visible:bg-pink-500/15"
                  : "hover:border-cyan-300/70 hover:bg-cyan-300/[0.08] focus-visible:border-cyan-300/70 focus-visible:bg-cyan-300/[0.08]"
              }`}
            >
              <SocialIcon platform={social.platform} />
              {social.name}
              {social.handle === "@growtellamoney" ? <span aria-hidden="true" className="text-base leading-none">💰</span> : null}
            </a>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p>© {new Date().getFullYear()} Calculadora Emprendedora</p>
          <nav aria-label="Otros proyectos de Growtella" className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {ecosystemTools.map((tool) => (
              <a key={tool.name} href={tool.href} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-200/65 transition hover:text-emerald-100">
                {tool.name} ↗<span className="sr-only"> (se abre en una nueva pestaña)</span>
              </a>
            ))}
          </nav>
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
