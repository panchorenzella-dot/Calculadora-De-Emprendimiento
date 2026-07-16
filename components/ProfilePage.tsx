"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

import AuthModal from "@/components/AuthModal";
import PlanUsageDashboard, { type UsageItem } from "@/components/PlanUsageDashboard";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SavedScenario } from "@/types/scenario";

type View = "inicio" | "analisis" | "escenarios" | "plan" | "cuenta";
type Conversation = {
  id: string;
  title: string;
  calculator_name: string;
  calculator_path: string;
  scenario_id: string | null;
  created_at: string;
  updated_at: string;
};
type PlanInfo = {
  plan: "free" | "pro";
  status: "inactive" | "trialing" | "active" | "past_due" | "canceled";
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

const FREE_PLAN: PlanInfo = {
  plan: "free",
  status: "inactive",
  current_period_start: null,
  current_period_end: null,
  cancel_at_period_end: false,
};

function defaultUsage(plan: "free" | "pro" = "free"): UsageItem[] {
  return [
    { resource: "analysis", used: 0, quota_limit: plan === "pro" ? 30 : 1, resets_at: null, plan },
    { resource: "chat", used: 0, quota_limit: plan === "pro" ? 300 : 5, resets_at: null, plan },
    { resource: "scenario", used: 0, quota_limit: plan === "pro" ? null : 3, resets_at: null, plan },
  ];
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function resultPreview(scenario: SavedScenario) {
  const text = String(scenario.results.resumen ?? "").replace(/\s+/g, " ");
  return text.slice(0, 170) || "Resultado guardado";
}

function profileFromUser(user: Session["user"] | undefined) {
  const metadata = user?.user_metadata ?? {};
  return {
    full_name: metadata.full_name || metadata.name || "",
    phone: metadata.phone || "",
    business_name: metadata.business_name || "",
    role: metadata.role || "",
    city: metadata.city || "",
  };
}

const navigation: Array<{ id: View; label: string; symbol: string }> = [
  { id: "inicio", label: "Resumen", symbol: "⌂" },
  { id: "analisis", label: "Análisis IA", symbol: "✦" },
  { id: "escenarios", label: "Escenarios", symbol: "▱" },
  { id: "plan", label: "Mi plan", symbol: "◆" },
  { id: "cuenta", label: "Cuenta", symbol: "○" },
];

export default function ProfilePage() {
  const configured = Boolean(getSupabaseClient());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(configured);
  const [view, setView] = useState<View>("inicio");
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [plan, setPlan] = useState<PlanInfo>(FREE_PLAN);
  const [usage, setUsage] = useState<UsageItem[]>(defaultUsage());
  const [editing, setEditing] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", phone: "", business_name: "", role: "", city: "" });
  const [message, setMessage] = useState(configured ? "" : "Falta configurar Supabase para habilitar el perfil.");

  async function loadData() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const [scenarioResponse, conversationResponse, planResponse, usageResponse] = await Promise.all([
      supabase.from("saved_scenarios").select("*").order("created_at", { ascending: false }),
      supabase.from("ai_conversations").select("id,title,calculator_name,calculator_path,scenario_id,created_at,updated_at").order("updated_at", { ascending: false }),
      supabase.from("user_plans").select("plan,status,current_period_start,current_period_end,cancel_at_period_end").maybeSingle(),
      supabase.rpc("get_my_usage_summary"),
    ]);
    if (scenarioResponse.error) setMessage(`No se pudieron cargar los escenarios: ${scenarioResponse.error.message}`);
    else setScenarios((scenarioResponse.data as SavedScenario[]) ?? []);
    if (conversationResponse.error) setMessage("No se pudieron cargar los análisis. Verificá la última migración de Supabase.");
    else setConversations((conversationResponse.data as Conversation[]) ?? []);
    const planData = planResponse.data as PlanInfo | null;
    const proIsActive = planData?.plan === "pro"
      && (planData.status === "active" || planData.status === "trialing")
      && (!planData.current_period_end || new Date(planData.current_period_end) > new Date());
    const effectivePlan = proIsActive && planData ? planData : FREE_PLAN;
    setPlan(effectivePlan);
    const usageData = usageResponse.data as UsageItem[] | null;
    setUsage(!usageResponse.error && usageData?.length ? usageData : defaultUsage(effectivePlan.plan));
  }

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setProfile(profileFromUser(data.session?.user));
      setLoading(false);
      if (data.session) void loadData();
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setProfile(profileFromUser(nextSession?.user));
      setLoading(false);
      if (nextSession) void loadData();
      else { setScenarios([]); setConversations([]); setPlan(FREE_PLAN); setUsage(defaultUsage()); }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) return;
    setSaving(true); setMessage("");
    const { data, error } = await supabase.auth.updateUser({ data: profile });
    setSaving(false);
    if (error) setMessage(`No se pudo guardar el perfil: ${error.message}`);
    else {
      if (data.user) setSession((current) => current ? { ...current, user: data.user } : current);
      setEditing(false); setMessage("Tus datos se actualizaron correctamente.");
    }
  }

  async function renameScenario(scenario: SavedScenario) {
    const title = window.prompt("Nuevo nombre para el escenario", scenario.title || "Escenario");
    if (!title?.trim()) return;
    const { error } = await getSupabaseClient()!.from("saved_scenarios").update({ title: title.trim() }).eq("id", scenario.id);
    if (error) setMessage(`No se pudo cambiar el nombre: ${error.message}`);
    else setScenarios((current) => current.map((item) => item.id === scenario.id ? { ...item, title: title.trim() } : item));
  }

  async function renameAnalysis(conversation: Conversation) {
    const title = window.prompt("Nuevo nombre para el análisis", conversation.title);
    if (!title?.trim()) return;
    const { error } = await getSupabaseClient()!.from("ai_conversations").update({ title: title.trim() }).eq("id", conversation.id);
    if (error) setMessage(`No se pudo cambiar el nombre: ${error.message}`);
    else setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, title: title.trim() } : item));
  }

  async function removeScenario(id: string) {
    if (!window.confirm("¿Eliminar este escenario?")) return;
    const { error } = await getSupabaseClient()!.from("saved_scenarios").delete().eq("id", id);
    if (error) setMessage(`Error al eliminar: ${error.message}`);
    else setScenarios((current) => current.filter((item) => item.id !== id));
  }

  async function removeAnalysis(id: string) {
    if (!window.confirm("¿Eliminar este análisis y toda su conversación? El escenario vinculado se conservará.")) return;
    const { error } = await getSupabaseClient()!.from("ai_conversations").delete().eq("id", id);
    if (error) setMessage(`Error al eliminar: ${error.message}`);
    else setConversations((current) => current.filter((item) => item.id !== id));
  }

  if (loading) return <div className="grid min-h-[65vh] place-items-center text-sm text-white/40">Cargando tu espacio...</div>;
  if (!session) return <main className="mx-auto min-h-[65vh] max-w-6xl px-4 py-16"><div className="mx-auto max-w-xl text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.05] text-emerald-200">✦</span><h1 className="mt-5 text-3xl font-semibold tracking-tight">Ingresá a tu espacio</h1><p className="mt-3 text-sm leading-6 text-white/45">Retomá análisis, administrá escenarios y mantené tus datos organizados.</p></div><AuthModal open returnTo="/perfil" /></main>;

  const user = session.user;
  const name = user.user_metadata.full_name || user.user_metadata.name || "Emprendedor/a";
  const initials = name.split(" ").slice(0, 2).map((part: string) => part[0]).join("").toUpperCase();
  const completedFields = Object.values(profile).filter(Boolean).length;
  const profileProgress = Math.round((completedFields / Object.keys(profile).length) * 100);

  const ScenarioRow = ({ scenario }: { scenario: SavedScenario }) => <article className="group border-b border-white/[0.07] py-5 last:border-0"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white/35">{scenario.calculator_type}</span><time className="text-[11px] text-white/25">{formatDate(scenario.created_at)}</time></div><h3 className="mt-3 truncate font-medium text-white/85">{scenario.title || "Escenario sin nombre"}</h3><p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-white/40">{resultPreview(scenario)}</p></div><div className="flex shrink-0 flex-wrap gap-2"><Link href={`/perfil/escenarios/${scenario.id}`} className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200">Abrir</Link><button onClick={() => void renameScenario(scenario)} className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-white/55 hover:bg-white/5 hover:text-white">Renombrar</button><button onClick={() => void removeScenario(scenario.id)} className="rounded-full border border-red-400/15 px-3.5 py-1.5 text-sm text-red-300/65 hover:bg-red-500/10 hover:text-red-200">Eliminar</button></div></div></article>;

  const AnalysisRow = ({ conversation }: { conversation: Conversation }) => <article className="group relative border-b border-white/[0.07] py-3 last:border-0"><div className="flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-white/[0.035]"><Link href={`/perfil/analisis/${conversation.id}`} className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-emerald-200/70">✦</span><span className="text-xs text-white/35">{conversation.calculator_name}</span></div><h3 className="mt-1.5 truncate text-[15px] font-medium text-white/85 group-hover:text-white">{conversation.title}</h3><p className="mt-1 truncate text-xs text-white/25">Última actividad: {formatDate(conversation.updated_at)} · {conversation.scenario_id ? "Escenario vinculado" : "Análisis anterior"}</p></Link><button onClick={() => setOpenMenu((current) => current === conversation.id ? null : conversation.id)} aria-label={`Opciones de ${conversation.title}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg tracking-[2px] text-white/30 opacity-60 transition hover:bg-white/[0.07] hover:text-white group-hover:opacity-100">•••</button>{openMenu === conversation.id && <div className="absolute right-2 top-12 z-30 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#17181a] p-1.5 text-sm shadow-2xl"><Link href={`/perfil/analisis/${conversation.id}`} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Abrir chat</Link><button onClick={() => { setOpenMenu(null); void renameAnalysis(conversation); }} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">Renombrar</button>{conversation.scenario_id && <Link href={`/perfil/escenarios/${conversation.scenario_id}`} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Ver escenario</Link>}<div className="my-1 h-px bg-white/[0.07]"/><button onClick={() => { setOpenMenu(null); void removeAnalysis(conversation.id); }} className="block w-full rounded-lg px-3 py-2 text-left text-red-300/75 hover:bg-red-500/10 hover:text-red-200">Eliminar</button></div>}</div></article>;

  return <main className="mx-auto min-h-[78vh] max-w-7xl px-4 py-6 sm:py-8">
    <div className="grid overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b0c0e]/80 shadow-[0_35px_120px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-white/[0.07] bg-black/20 p-3 lg:min-h-[740px] lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-3 py-3"><span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-semibold">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{name}</p><p className="truncate text-[11px] text-white/30">{user.email}</p></div></div>
        <nav className="mt-3 flex gap-1 overflow-x-auto lg:block lg:space-y-1">{navigation.map((item) => <button key={item.id} onClick={() => setView(item.id)} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition lg:w-full ${view === item.id ? "bg-white/[0.07] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/75"}`}><span className="w-4 text-center text-xs">{item.symbol}</span>{item.label}{item.id === "analisis" && conversations.length > 0 && <span className="ml-auto rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] text-white/40">{conversations.length}</span>}</button>)}</nav>
        <div className="mt-4 hidden border-t border-white/[0.07] pt-4 lg:block"><Link href="/calculadoras" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 hover:bg-white/[0.04] hover:text-white/75"><span className="w-4 text-center">＋</span>Nueva consulta</Link></div>
      </aside>

      <div className="min-w-0 p-5 sm:p-8 lg:p-10">
        {message && <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 text-sm text-white/60"><span>{message}</span><button onClick={() => setMessage("")} className="text-white/30 hover:text-white">×</button></div>}

        {view === "inicio" && <>
          <div><p className="text-xs text-emerald-200/60">Tu espacio de trabajo</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Hola, {name.split(" ")[0]}</h1><p className="mt-2 text-sm text-white/40">Retomá una conversación o revisá los números que guardaste.</p></div>
          <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><p className="text-xs text-white/35">Análisis IA</p><p className="mt-3 text-3xl font-medium">{conversations.length}</p><button onClick={() => setView("analisis")} className="mt-3 text-sm text-white/40 hover:text-white">Ver conversaciones →</button></div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><p className="text-xs text-white/35">Escenarios</p><p className="mt-3 text-3xl font-medium">{scenarios.length}</p><button onClick={() => setView("escenarios")} className="mt-3 text-sm text-white/40 hover:text-white">Administrar →</button></div>
            <div className="rounded-2xl border border-emerald-300/15 bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.12),transparent_70%)] p-5"><p className="text-xs text-emerald-100/45">Plan actual</p><p className="mt-3 text-2xl font-medium text-emerald-100">{plan.plan === "pro" ? "Pro" : "Gratis"}</p><button onClick={() => setView("plan")} className="mt-4 text-sm text-emerald-100/50 hover:text-emerald-100">Ver límites →</button></div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><p className="text-xs text-white/35">Perfil completo</p><p className="mt-3 text-3xl font-medium">{profileProgress}%</p><div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-emerald-300/70" style={{ width: `${profileProgress}%` }}/></div></div>
          </section>
          <section className="mt-9"><div className="flex items-center justify-between"><h2 className="text-lg font-medium">Continuar donde lo dejaste</h2><button onClick={() => setView("analisis")} className="text-sm text-white/35 hover:text-white">Ver todo</button></div><div className="mt-3">{conversations.length ? conversations.slice(0, 3).map((item) => <AnalysisRow key={item.id} conversation={item}/>) : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center"><p className="text-sm text-white/35">Todavía no generaste ningún análisis.</p><Link href="/calculadoras" className="mt-4 inline-block rounded-full border border-white/12 bg-black px-3.5 py-1.5 text-sm text-white/70">Elegir calculadora</Link></div>}</div></section>
        </>}

        {view === "analisis" && <><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs text-emerald-200/60">Historial inteligente</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Análisis IA</h1><p className="mt-2 text-sm text-white/40">Abrí una conversación exactamente donde la dejaste.</p></div><Link href="/calculadoras" className="rounded-full border border-white/12 bg-black px-3.5 py-2 text-center text-sm text-white/75 hover:bg-zinc-900">Nuevo análisis</Link></div><section className="mt-8">{conversations.length ? conversations.map((item) => <AnalysisRow key={item.id} conversation={item}/>) : <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/35">No hay análisis guardados todavía.</p>}</section></>}

        {view === "escenarios" && <><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs text-emerald-200/60">Biblioteca de cálculos</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Escenarios</h1><p className="mt-2 text-sm text-white/40">Organizá, renombrá y revisá todos tus resultados.</p></div><Link href="/calculadoras" className="rounded-full border border-white/12 bg-black px-3.5 py-2 text-center text-sm text-white/75 hover:bg-zinc-900">Crear escenario</Link></div><section className="mt-8">{scenarios.length ? scenarios.map((item) => <ScenarioRow key={item.id} scenario={item}/>) : <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/35">No hay escenarios guardados todavía.</p>}</section></>}

        {view === "plan" && <>
          <div><p className="text-xs text-emerald-200/60">Suscripción</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Mi plan</h1><p className="mt-2 text-sm text-white/40">Consultá tu nivel de acceso, tus consumos y la próxima fecha de renovación.</p></div>
          <section className="relative mt-8 overflow-hidden rounded-[26px] border border-emerald-300/20 bg-[linear-gradient(145deg,rgba(16,185,129,0.12),rgba(255,255,255,0.025)_55%,rgba(0,0,0,0.12))] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-300/[0.08] blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><span className="rounded-full border border-emerald-200/20 bg-emerald-200/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">{plan.plan === "pro" ? "Pro" : "Gratis"}</span>{plan.plan === "pro" && <span className="text-xs text-white/35">Activo</span>}</div><h2 className="mt-5 text-3xl font-semibold tracking-tight">{plan.plan === "pro" ? "Más espacio para profundizar" : "Todo lo esencial para empezar"}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/45">{plan.plan === "pro" ? "Tu cuenta tiene acceso al modelo avanzado y a los cupos mensuales ampliados." : "Podés usar todas las calculadoras, guardar escenarios y probar el asistente con límites gratuitos."}</p></div>{plan.plan === "free" && <Link href="/precios" className="relative shrink-0 rounded-full border border-emerald-300/30 bg-emerald-700 px-4 py-2.5 text-center text-sm font-bold text-white shadow-[0_10px_30px_rgba(16,185,129,0.18)] transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70">Conocer Pro</Link>}</div>
            <div className="relative mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/[0.08] bg-black/20 p-5"><p className="text-xs text-white/35">Análisis con IA</p><p className="mt-2 text-xl font-semibold text-white/90">{plan.plan === "pro" ? "30 por mes" : "1 por semana"}</p></div><div className="rounded-2xl border border-white/[0.08] bg-black/20 p-5"><p className="text-xs text-white/35">Mensajes</p><p className="mt-2 text-xl font-semibold text-white/90">{plan.plan === "pro" ? "300 por mes" : "5 por día"}</p></div><div className="rounded-2xl border border-white/[0.08] bg-black/20 p-5"><p className="text-xs text-white/35">Escenarios</p><p className="mt-2 text-xl font-semibold text-white/90">{plan.plan === "pro" ? "Ilimitados" : "3 por día"}</p></div></div>
          </section>
          <PlanUsageDashboard plan={plan} usage={usage} />
          <section className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/[0.07] p-5"><p className="text-sm font-medium text-white/75">Tus datos siguen siendo tuyos</p><p className="mt-2 text-xs leading-5 text-white/35">Cambiar de plan no elimina escenarios ni conversaciones guardadas.</p></div><div className="rounded-2xl border border-white/[0.07] p-5"><p className="text-sm font-medium text-white/75">Renovación clara</p><p className="mt-2 text-xs leading-5 text-white/35">La plataforma te muestra cuándo vuelve a habilitarse cada cupo.</p></div><div className="rounded-2xl border border-white/[0.07] p-5"><p className="text-sm font-medium text-white/75">Sin sorpresas</p><p className="mt-2 text-xs leading-5 text-white/35">Si alcanzás un límite, tus cálculos continúan disponibles.</p></div></section>
        </>}

        {view === "cuenta" && <><div><p className="text-xs text-emerald-200/60">Configuración</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Cuenta y perfil</h1><p className="mt-2 text-sm text-white/40">Personalizá la información asociada a tu espacio.</p></div><section className="mt-8 border-y border-white/[0.07] py-6"><div className="flex items-center justify-between"><div><h2 className="font-medium">Datos personales</h2><p className="mt-1 text-xs text-white/35">Esta información ayuda a personalizar futuras funciones.</p></div>{!editing && <button onClick={() => setEditing(true)} className="rounded-full border border-white/12 bg-black px-3.5 py-1.5 text-sm text-white/70 hover:bg-zinc-900">Editar</button>}</div>{editing ? <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">{[["full_name","Nombre completo","Tu nombre"],["phone","Teléfono","+54 9..."],["business_name","Emprendimiento","Nombre del negocio"],["role","Actividad","Ej. comerciante"],["city","Ciudad","Tu ciudad"]].map(([key,label,placeholder]) => <label key={key} className="grid gap-2 text-xs text-white/40">{label}<input value={profile[key as keyof typeof profile]} onChange={(event) => setProfile({ ...profile, [key]: event.target.value })} placeholder={placeholder} className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none focus:border-white/20"/></label>)}<div className="flex gap-2 sm:col-span-2"><button disabled={saving} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950">{saving ? "Guardando..." : "Guardar cambios"}</button><button type="button" onClick={() => setEditing(false)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/50">Cancelar</button></div></form> : <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2"><div><dt className="text-xs text-white/30">Nombre</dt><dd className="mt-1 text-white/75">{name}</dd></div><div><dt className="text-xs text-white/30">Email</dt><dd className="mt-1 break-all text-white/75">{user.email}</dd></div><div><dt className="text-xs text-white/30">Teléfono</dt><dd className="mt-1 text-white/75">{profile.phone || "Sin completar"}</dd></div><div><dt className="text-xs text-white/30">Emprendimiento</dt><dd className="mt-1 text-white/75">{profile.business_name || "Sin completar"}</dd></div><div><dt className="text-xs text-white/30">Actividad</dt><dd className="mt-1 text-white/75">{profile.role || "Sin completar"}</dd></div><div><dt className="text-xs text-white/30">Ciudad</dt><dd className="mt-1 text-white/75">{profile.city || "Sin completar"}</dd></div></dl>}</section><section className="py-6"><h2 className="font-medium">Sesión</h2><p className="mt-1 text-xs text-white/35">Cuenta creada el {formatDate(user.created_at)}.</p><button onClick={() => getSupabaseClient()?.auth.signOut()} className="mt-5 rounded-full border border-red-400/20 bg-red-500/[0.06] px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10">Cerrar sesión</button></section></>}
      </div>
    </div>
  </main>;
}
