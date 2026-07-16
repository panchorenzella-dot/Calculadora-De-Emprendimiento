import Link from "next/link";

export default function ConsumerRightsBar() {
  return (
    <aside aria-label="Derechos del consumidor" className="border-b border-emerald-300/15 bg-emerald-300/[0.055] px-4 py-2.5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-[10px] font-bold uppercase tracking-[0.13em] sm:text-[11px]">
        <Link className="rounded-full border border-emerald-300/25 px-3 py-1.5 text-emerald-200 transition hover:bg-emerald-300/10" href="/arrepentimiento">
          Botón de arrepentimiento
        </Link>
        <Link className="rounded-full border border-white/15 px-3 py-1.5 text-white/75 transition hover:border-white/30 hover:text-white" href="/baja-servicio">
          Botón de baja de servicio
        </Link>
      </div>
    </aside>
  );
}
