import Link from "next/link";

import { siteConfig } from "@/lib/site";

const trustItems = [
  { number: "01", title: "Cálculos transparentes", copy: "Cada herramienta explica qué datos utiliza, qué resultado entrega y cuáles son sus limitaciones." },
  { number: "02", title: "Probá sin registrarte", copy: "Podés calcular primero. La cuenta se utiliza únicamente cuando querés guardar, comparar o analizar un resultado." },
  { number: "03", title: "Tus datos, en tu cuenta", copy: "Los escenarios guardados quedan asociados a tu acceso y protegidos por las reglas de seguridad de la plataforma." },
  { number: "04", title: "Pago protegido", copy: "Las suscripciones se confirman en PayPal. Calculadora Emprendedora no recibe ni almacena los datos de tu tarjeta." },
];

export default function TrustSection() {
  return (
    <section aria-labelledby="trust-title" className="rounded-[30px] border border-white/[0.08] bg-[#070907] p-6 sm:p-9">
      <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/55">Claridad y confianza</p>
          <h2 id="trust-title" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Sabés qué calculamos y qué pasa con tus datos</h2>
          <p className="mt-4 text-sm leading-7 text-white/50">No mostramos números inventados ni testimonios que todavía no tenemos. Preferimos explicar con precisión cómo funciona el servicio.</p>
          <a href={`mailto:${siteConfig.contactEmail}`} className="mt-5 inline-flex text-sm font-bold text-white/75 hover:text-white">{siteConfig.contactEmail} →</a>
        </div>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
          {trustItems.map((item) => <article key={item.number} className="bg-[#0a0d0b] p-5 sm:p-6"><p className="text-[10px] font-bold tracking-[0.16em] text-emerald-200/45">{item.number}</p><h3 className="mt-3 text-base font-bold text-white/90">{item.title}</h3><p className="mt-2 text-sm leading-6 text-white/45">{item.copy}</p></article>)}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.07] pt-5 text-xs font-semibold text-white/45">
        <Link href="/politica-de-privacidad" className="hover:text-white">Privacidad</Link>
        <Link href="/terminos-y-condiciones" className="hover:text-white">Términos</Link>
        <Link href="/cancelaciones-y-reembolsos" className="hover:text-white">Cancelaciones y reembolsos</Link>
        <Link href="/contacto" className="hover:text-white">Contacto</Link>
      </div>
    </section>
  );
}

