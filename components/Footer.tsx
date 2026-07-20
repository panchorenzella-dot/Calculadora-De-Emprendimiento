import Link from "next/link";

const links = [
  ["/precios", "Planes"],
  ["/perfil", "Perfil"],
  ["/terminos-y-condiciones", "Términos"],
  ["/cancelaciones-y-reembolsos", "Cancelaciones"],
  ["/politica-de-privacidad", "Privacidad"],
  ["/contacto", "Contacto"],
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-7 text-xs text-white/55">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p>© {new Date().getFullYear()} Calculadora Emprendedora</p>
          <p className="mt-1 font-medium text-emerald-200/55">Originado por Zella AI</p>
        </div>
        <nav aria-label="Enlaces legales y de ayuda" className="flex flex-wrap gap-x-4 gap-y-3">
          {links.map(([href, label]) => (
            <Link key={href} className="transition hover:text-white" href={href}>{label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
