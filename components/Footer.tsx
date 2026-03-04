import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-4 text-xs text-white/60">
      <div className="flex items-center justify-between">
        <div>© {new Date().getFullYear()} Calculadora Emprendedora</div>

        <div className="flex gap-4">
          <Link className="hover:text-white" href="/politica-de-privacidad">
            Política de privacidad
          </Link>
          <Link className="hover:text-white" href="/contacto">
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}