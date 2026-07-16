import Link from "next/link";

const reasons = [
  ["Consultas", "¿No sabés qué calculadora usar? Contanos qué necesitás resolver."],
  ["Sugerencias", "Tus ideas nos ayudan a crear herramientas cada vez más útiles."],
  ["Reportar un error", "Si algo no funciona como esperabas, envianos el detalle y lo revisamos."],
];

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.12),transparent_45%)]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/75">Estamos para ayudarte</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">Hablemos de tu experiencia</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">Consultas, sugerencias o errores: escribinos y ayudanos a hacer de Calculadora Emprendedora una herramienta mejor.</p>
          <a href="mailto:calculadoraemprendedora@gmail.com" className="mt-8 inline-flex rounded-full bg-white px-4 py-2.5 text-sm font-medium !text-black transition hover:bg-zinc-200">Enviar un email →</a>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-4 md:grid-cols-3">{reasons.map(([title, text]) => <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"><div className="mb-5 h-1 w-10 rounded-full bg-emerald-300"/><h2 className="text-lg font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-white/55">{text}</p></article>)}</div>
        <section className="mt-12 grid gap-6 rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.04] p-7 md:grid-cols-[1fr_auto] md:items-center">
          <div><p className="text-sm text-emerald-300">Canal de contacto</p><h2 className="mt-2 text-2xl font-semibold">calculadoraemprendedora@gmail.com</h2><p className="mt-3 text-sm text-white/55">Incluí una breve descripción y, si se trata de un error, qué calculadora estabas usando.</p></div>
          <a href="mailto:calculadoraemprendedora@gmail.com?subject=Consulta%20desde%20Calculadora%20Emprendedora" className="rounded-full border border-white/15 bg-black px-4 py-2 text-center text-sm font-medium text-white/80 hover:bg-zinc-900">Escribir ahora</a>
        </section>
        <section className="mt-14 max-w-3xl"><p className="text-xs uppercase tracking-[0.18em] text-white/40">Sobre la plataforma</p><h2 className="mt-3 text-2xl font-semibold">Decisiones más claras para tu negocio</h2><p className="mt-4 leading-7 text-white/55">Creamos herramientas gratuitas y simples para que emprendedores, comerciantes y profesionales puedan analizar márgenes, rentabilidad, inversión, ahorro y costos sin perderse en fórmulas complejas.</p><Link href="/calculadoras" className="mt-5 inline-block text-sm font-semibold text-emerald-300 hover:text-emerald-200">Explorar calculadoras →</Link></section>
      </div>
    </main>
  );
}
