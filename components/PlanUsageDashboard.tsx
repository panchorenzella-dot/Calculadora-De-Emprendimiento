"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PLAN_GRACE_DAYS } from "@/lib/plans";

export type UsageItem = {
  resource: "analysis" | "chat" | "scenario";
  used: number;
  quota_limit: number | null;
  resets_at: string | null;
  plan: "free" | "pro";
};

type PlanPeriod = {
  plan: "free" | "pro";
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  provider: string | null;
};

const DAY_MS = 86_400_000;

const labels = {
  analysis: { name: "Análisis con IA", short: "análisis" },
  chat: { name: "Mensajes con IA", short: "mensajes" },
  scenario: { name: "Escenarios guardados", short: "escenarios" },
};

function date(value: string) {
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function UsageRing({ item }: { item: UsageItem }) {
  const limit = item.quota_limit;
  const unlimited = limit === null;
  const remaining = limit === null ? null : Math.max(limit - item.used, 0);
  const consumed = limit === null ? 0 : Math.min((item.used / Math.max(limit, 1)) * 100, 100);
  const meta = labels[item.resource];

  return (
    <article className="rounded-3xl border border-white/[0.08] bg-black/20 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/78">{meta.name}</p>
          <p className="mt-1 text-xs text-white/32">{unlimited ? `${item.used} usados este mes` : `${item.used} de ${item.quota_limit} usados`}</p>
        </div>
        <div className="relative grid h-20 w-20 shrink-0 place-items-center">
          <svg viewBox="0 0 42 42" className="h-20 w-20 -rotate-90" aria-hidden="true">
            <circle cx="21" cy="21" r="16" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="3" />
            <circle cx="21" cy="21" r="16" fill="none" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" pathLength="100" strokeDasharray={`${unlimited ? 100 : consumed} 100`} />
          </svg>
          <span className="absolute text-lg font-semibold text-emerald-100">{unlimited ? "∞" : remaining}</span>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs">
        <span className="text-white/32">{unlimited ? "Sin límite" : `${remaining} ${meta.short} disponibles`}</span>
        {item.resets_at && !unlimited && <span className="text-emerald-100/55">El cupo se reinicia {date(item.resets_at)}</span>}
      </div>
    </article>
  );
}

export default function PlanUsageDashboard({ plan, usage }: { plan: PlanPeriod; usage: UsageItem[] }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const billing = useMemo(() => {
    if (plan.plan !== "pro") return { kind: "free" } as const;
    if (!plan.current_period_end) return { kind: "lifetime" } as const;

    const end = new Date(plan.current_period_end).getTime();
    if (Number.isNaN(end)) return { kind: "free" } as const;

    const graceEnd = end + PLAN_GRACE_DAYS * DAY_MS;
    if (now > graceEnd) return { kind: "free" } as const;
    if (now > end) {
      return {
        kind: "grace",
        end: plan.current_period_end,
        graceEnd: new Date(graceEnd).toISOString(),
        daysLeft: Math.max(Math.ceil((graceEnd - now) / DAY_MS), 0),
      } as const;
    }

    const parsedStart = plan.current_period_start ? new Date(plan.current_period_start).getTime() : now;
    const start = Number.isNaN(parsedStart) ? now : parsedStart;
    const total = Math.max(end - start, 1);
    const progress = Math.min(Math.max(((now - start) / total) * 100, 0), 100);
    const daysLeft = Math.max(Math.ceil((end - now) / DAY_MS), 0);
    const totalDays = Math.round(total / DAY_MS);
    const interval = totalDays >= 300 ? "anual" : totalDays >= 80 ? "trimestral" : "mensual";
    return { kind: "paid", progress, daysLeft, end: plan.current_period_end, interval } as const;
  }, [now, plan]);

  const renewalLabel = plan.provider === "manual"
    ? "Asignación manual"
    : plan.cancel_at_period_end
      ? "Finaliza ese día"
      : "Renovación automática";

  return (
    <>
      <section className="mt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/55">Consumo del período</p><h2 className="mt-2 text-xl font-medium">Lo que todavía tenés disponible</h2></div>
          <p className="text-xs text-white/30">Los medidores se actualizan con cada uso.</p>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">{usage.map((item) => <UsageRing key={item.resource} item={item} />)}</div>
      </section>

      {billing.kind === "paid" && (
        <section className="mt-8 rounded-3xl border border-emerald-300/15 bg-[linear-gradient(135deg,rgba(16,185,129,0.09),rgba(255,255,255,0.02))] p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/55">Próximo pago</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">{date(billing.end)}</h2><p className="mt-2 text-sm text-white/40">Ciclo {billing.interval} · {billing.daysLeft} {billing.daysLeft === 1 ? "día restante" : "días restantes"}</p></div><div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/45">{renewalLabel}</div></div>
          <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-200 transition-[width] duration-700" style={{ width: `${billing.progress}%` }} /></div>
          <div className="mt-3 flex justify-between text-[11px] text-white/28"><span>Inicio del ciclo</span><span>{Math.round(billing.progress)}% transcurrido</span><span>Fecha de pago</span></div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row"><div aria-disabled="true" className="cursor-not-allowed rounded-full border border-emerald-200/20 bg-emerald-200/[0.06] px-4 py-2 text-center text-sm font-semibold text-emerald-100/55">Adelantar un mes · próximamente</div><Link href="/precios" className="rounded-full border border-white/10 px-4 py-2 text-center text-sm text-white/55 hover:bg-white/[0.04] hover:text-white">Ver opciones trimestral y anual</Link></div>
        </section>
      )}

      {billing.kind === "grace" && (
        <section role="alert" className="mt-8 rounded-3xl border border-amber-300/25 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(255,255,255,0.02))] p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/70">Período de gracia</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Tu pago venció el {date(billing.end)}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Mantenés todas las funciones Pro durante {PLAN_GRACE_DAYS} días adicionales. Regularizá el pago antes del {date(billing.graceEnd)} para evitar que la cuenta vuelva al plan Gratis.</p></div><div className="rounded-full border border-amber-200/20 bg-amber-200/[0.08] px-3 py-1.5 text-xs font-semibold text-amber-100">{billing.daysLeft} {billing.daysLeft === 1 ? "día de gracia" : "días de gracia"}</div></div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-200" /></div>
          <Link href="/precios" className="mt-6 inline-block rounded-full bg-amber-300 px-4 py-2 text-center text-sm font-bold text-amber-950 hover:bg-amber-200">Actualizar el pago</Link>
        </section>
      )}

      {billing.kind === "lifetime" && (
        <section className="mt-8 rounded-3xl border border-emerald-300/15 bg-[linear-gradient(135deg,rgba(16,185,129,0.09),rgba(255,255,255,0.02))] p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/55">Plan Pro</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Acceso de por vida</h2><p className="mt-2 text-sm text-white/40">Tu plan no tiene fecha de vencimiento. Solamente se reinician los cupos de análisis y mensajes cada mes.</p></div><div className="rounded-full border border-emerald-200/20 bg-emerald-200/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-100">Sin vencimiento</div></div>
          <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-200" /></div>
          <div className="mt-3 flex justify-between text-[11px] text-white/28"><span>Pro activo</span><span>Acceso permanente</span></div>
        </section>
      )}

      {billing.kind === "free" && (
        <section className="mt-8 flex flex-col gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-white/75">Tu plan Gratis no vence</p><p className="mt-1 text-xs leading-5 text-white/35">Cada medidor muestra su propia fecha de renovación.</p></div><Link href="/precios" className="rounded-full border border-emerald-200/20 bg-emerald-200/[0.06] px-4 py-2 text-center text-sm font-semibold text-emerald-100">Ver Pro</Link></section>
      )}
    </>
  );
}
