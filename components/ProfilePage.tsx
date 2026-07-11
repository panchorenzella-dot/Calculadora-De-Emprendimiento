"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import AuthModal from "@/components/AuthModal";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SavedScenario } from "@/types/scenario";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function resultPreview(scenario: SavedScenario) {
  const text = String(scenario.results.resumen ?? "").replace(/\s+/g, " ");
  return text.slice(0, 150) || "Resultado guardado";
}

export default function ProfilePage() {
  const configured = Boolean(getSupabaseClient());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(configured);
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [message, setMessage] = useState(
    configured ? "" : "Falta configurar Supabase para habilitar el perfil."
  );

  async function loadScenarios() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("saved_scenarios")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setMessage(`No se pudieron cargar los escenarios: ${error.message}`);
    else setScenarios((data as SavedScenario[]) ?? []);
  }

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session) void loadScenarios();
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      if (nextSession) void loadScenarios();
      else setScenarios([]);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function removeScenario(id: string) {
    if (!window.confirm("¿Eliminar este escenario?")) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("saved_scenarios").delete().eq("id", id);
    if (error) setMessage(`Error al eliminar: ${error.message}`);
    else {
      setScenarios((current) => current.filter((item) => item.id !== id));
      setMessage("Escenario eliminado.");
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-white/60">Cargando perfil...</div>;
  }

  if (!session) {
    return (
      <main className="mx-auto min-h-[65vh] max-w-6xl px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/75">
            Tu espacio
          </p>
          <h1 className="mt-3 text-3xl font-bold">Ingresá a tu perfil</h1>
          <p className="mt-4 text-sm leading-6 text-white/60">
            Accedé a tus escenarios guardados y a las próximas funciones de
            comparación y análisis.
          </p>
        </div>
        <AuthModal open returnTo="/perfil" />
      </main>
    );
  }

  const user = session.user;
  const name =
    user.user_metadata.full_name || user.user_metadata.name || "Emprendedor/a";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/70">
            Mi cuenta
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Mi perfil</h1>
          <p className="mt-2 text-white/55">Tus cálculos y próximos recursos, en un solo lugar.</p>
        </div>
        <button
          type="button"
          onClick={() => getSupabaseClient()?.auth.signOut()}
          className="w-fit rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:bg-white/5"
        >
          Cerrar sesión
        </button>
      </div>

      {message && (
        <p className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          {message}
        </p>
      )}

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Resumen</p>
          <h2 className="mt-3 text-2xl font-semibold">{name}</h2>
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div><p className="text-white/40">Email</p><p className="mt-1 break-all text-white/75">{user.email}</p></div>
            <div><p className="text-white/40">Registro</p><p className="mt-1 text-white/75">{formatDate(user.created_at)}</p></div>
            <div><p className="text-white/40">Plan actual</p><p className="mt-1 font-semibold text-emerald-300">Gratis</p></div>
          </div>
        </article>

        <article className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.045] p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-300/70">Suscripción</p>
          <h2 className="mt-3 text-xl font-semibold">Plan Gratis</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/65">
            <li>✓ Usar todas las calculadoras</li>
            <li>✓ Guardar escenarios</li>
            <li>✓ Ver historial básico</li>
          </ul>
        </article>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">Historial</p>
            <h2 className="mt-2 text-2xl font-semibold">Escenarios guardados</h2>
          </div>
          <Link href="/calculadoras" className="text-sm font-semibold text-white/60 hover:text-white">Nueva consulta →</Link>
        </div>

        {scenarios.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">
            Todavía no guardaste escenarios. Usá una calculadora y guardá tu primer cálculo.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {scenarios.map((scenario) => (
              <article key={scenario.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">{scenario.calculator_type}</p>
                    <h3 className="mt-2 text-lg font-semibold">{scenario.title || "Escenario sin nombre"}</h3>
                  </div>
                  <time className="shrink-0 text-xs text-white/40">{formatDate(scenario.created_at)}</time>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/55">{resultPreview(scenario)}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/perfil/escenarios/${scenario.id}`} className="rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-zinc-950">Abrir</Link>
                  <button disabled className="rounded-lg border border-white/10 px-3.5 py-2 text-xs text-white/35">Comparar · Próximamente</button>
                  <button onClick={() => removeScenario(scenario.id)} className="rounded-lg border border-red-300/15 px-3.5 py-2 text-xs text-red-200/70 hover:bg-red-300/5">Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Datos personales</p>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-white/40">Nombre</dt><dd className="mt-1">{name}</dd></div>
            <div><dt className="text-white/40">Email</dt><dd className="mt-1 break-all">{user.email}</dd></div>
            <div><dt className="text-white/40">Fecha de registro</dt><dd className="mt-1">{formatDate(user.created_at)}</dd></div>
          </dl>
          <button disabled className="mt-6 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/35">Editar perfil · Próximamente</button>
        </article>

        <article className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-emerald-300/[0.035] p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Próximamente Plan Pro</p>
          <h2 className="mt-3 text-xl font-semibold">Más herramientas para decidir</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/60">
            <span>Escenarios ilimitados</span><span>Comparar escenarios</span>
            <span>Exportar PDF</span><span>Análisis con IA</span>
            <span className="col-span-2">Recomendaciones para mejorar rentabilidad</span>
          </div>
        </article>
      </section>
    </main>
  );
}
