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
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-4 shrink-0 text-white/55 transition group-hover:text-white group-focus-visible:text-white">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0 text-white/55 transition group-hover:text-white group-focus-visible:text-white">
      <path d="M16.6 2h-3.5v13.8a3 3 0 1 1-2.6-3V9.3a6.5 6.5 0 1 0 6.1 6.5V8.9a9 9 0 0 0 5.4 1.8V7.2A5.4 5.4 0 0 1 16.6 2Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] px-4 py-8 text-xs text-white/42 print:hidden sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-medium text-white/78">Calculadora Emprendedora</p>
            <p className="mt-2 text-xs leading-5 text-white/38">Herramientas simples para decidir con números claros. Un producto de Growtella.</p>
          </div>
          <nav aria-label="Enlaces legales y de ayuda" className="flex max-w-2xl flex-wrap gap-x-5 gap-y-3">
            {links.map(([href, label]) => (
              <Link key={href} prefetch={href === "/perfil" ? false : undefined} className="transition hover:text-white" href={href}>{label}</Link>
            ))}
          </nav>
        </div>

        <div className="mt-7 flex flex-col gap-5 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p>© {new Date().getFullYear()} Calculadora Emprendedora</p>
            {ecosystemTools.map((tool) => (
              <a key={tool.name} href={tool.href} target="_blank" rel="noopener noreferrer" className="text-white/48 transition hover:text-white">
                {tool.name} ↗<span className="sr-only"> (se abre en una nueva pestaña)</span>
              </a>
            ))}
          </div>
          <nav aria-label="Redes sociales de Growtella" className="flex flex-wrap gap-2">
          {socialLinks.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${social.name}, ${social.handle} (se abre en una nueva pestaña)`}
              className="group inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-white/55 transition hover:border-white/16 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-200"
            >
              <SocialIcon platform={social.platform} />
              {social.name}
            </a>
          ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
