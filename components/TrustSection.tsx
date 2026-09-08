import Link from "next/link";

import { siteConfig } from "@/lib/site";

const trustItems = [
  {
    number: "01",
    title: "Metodología explícita",
    copy: "Cada herramienta aclara qué datos utiliza, qué entrega el resultado y cuáles son sus límites.",
  },
  {
    number: "02",
    title: "Ejemplos comprobables",
    copy: "Las guías muestran fórmulas y casos numéricos para que puedas seguir la cuenta paso a paso.",
  },
  {
    number: "03",
    title: "Primero probás",
    copy: "Las calculadoras funcionan sin registro. La cuenta se pide únicamente para guardar, comparar o analizar.",
  },
  {
    number: "04",
    title: "Cuenta y pago separados",
    copy: "Tus escenarios quedan asociados a tu acceso y los pagos se procesan en PayPal, fuera de la plataforma.",
  },
];

export default function TrustSection() {
  return (
    <section
      aria-labelledby="trust-title"
      className="rounded-[30px] border border-white/[0.08] bg-[#070907] p-6 sm:p-9"
    >
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/55">
            Información verificable
          </p>
          <h2 id="trust-title" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Revisá el cálculo antes de confiar en él
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/50">
            La confianza empieza por entender de dónde sale cada resultado. Por eso
            publicamos el criterio, señalamos qué falta contemplar y mantenemos un
            canal directo para consultas.
          </p>
          <div className="mt-5 rounded-2xl border border-emerald-300/12 bg-emerald-300/[0.045] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/50">
              Desarrollado por Growtella
            </p>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="mt-2 inline-flex break-all text-sm font-bold text-white/75 hover:text-white"
            >
              {siteConfig.contactEmail} →
            </a>
          </div>
        </div>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
          {trustItems.map((item) => (
            <article key={item.number} className="bg-[#0a0d0b] p-5 sm:p-6">
              <p className="text-[10px] font-bold tracking-[0.16em] text-emerald-200/45">
                {item.number}
              </p>
              <h3 className="mt-3 text-base font-bold text-white/90">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/45">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
      <nav
        aria-label="Información legal y contacto"
        className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.07] pt-5 text-xs font-semibold text-white/45"
      >
        <Link href="/politica-de-privacidad" className="hover:text-white">
          Privacidad
        </Link>
        <Link href="/terminos-y-condiciones" className="hover:text-white">
          Términos
        </Link>
        <Link href="/cancelaciones-y-reembolsos" className="hover:text-white">
          Cancelaciones y reembolsos
        </Link>
        <Link href="/contacto" className="hover:text-white">
          Contacto
        </Link>
      </nav>
    </section>
  );
}
