import { ecosystemTools } from "@/lib/ecosystem";

export default function EcosystemTools() {
  return (
    <section aria-labelledby="ecosystem-tools-title" className="py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/75">
        Seguí impulsando tu emprendimiento
      </p>
      <h2 id="ecosystem-tools-title" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        Más herramientas para tu negocio
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
        Ya tenés tus números. Descubrí recursos para dar el próximo paso.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {ecosystemTools.map((tool) => (
          <a
            key={tool.name}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${tool.action} (se abre en una nueva pestaña)`}
            className="group flex flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-300/[0.06] to-white/[0.02] p-6 transition hover:-translate-y-0.5 hover:border-emerald-300/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-200 sm:p-7"
          >
            <p className="text-xs font-semibold text-emerald-200/70">{tool.category}</p>
            <h3 className="mt-3 text-2xl font-bold text-white">{tool.name}</h3>
            <p className="mt-3 text-sm leading-6 text-white/65">{tool.description}</p>
            <span className="mt-auto pt-6 text-sm font-semibold text-emerald-200 group-hover:text-emerald-100">
              {tool.action} <span aria-hidden="true">↗</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
