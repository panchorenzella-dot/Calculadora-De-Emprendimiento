"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AuthModal from "@/components/AuthModal";
import PlanUsageDashboard, { type UsageItem } from "@/components/PlanUsageDashboard";
import { PLAN_GRACE_DAYS } from "@/lib/plans";
import { getCalculatorInfo, getScenarioMetrics, getScenarioPreview } from "@/lib/scenarios";
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
  provider: string | null;
};
type ProfileData = {
  full_name: string;
  phone: string;
  business_name: string;
  role: string;
  city: string;
  business_type: string;
  business_stage: string;
  main_goal: string;
  preferred_currency: string;
};

const FREE_PLAN: PlanInfo = {
  plan: "free",
  status: "inactive",
  current_period_start: null,
  current_period_end: null,
  cancel_at_period_end: false,
  provider: null,
};

const EMPTY_PROFILE: ProfileData = {
  full_name: "",
  phone: "",
  business_name: "",
  role: "",
  city: "",
  business_type: "",
  business_stage: "",
  main_goal: "",
  preferred_currency: "ARS",
};

const navigation: Array<{ id: View; label: string; symbol: string }> = [
  { id: "inicio", label: "Resumen", symbol: "⌂" },
  { id: "analisis", label: "Análisis IA", symbol: "✦" },
  { id: "escenarios", label: "Escenarios", symbol: "▱" },
  { id: "plan", label: "Mi plan", symbol: "◆" },
  { id: "cuenta", label: "Mi perfil", symbol: "○" },
];

function isView(value: string | null): value is View {
  return navigation.some((item) => item.id === value);
}

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

function formatRelativeDate(value?: string) {
  if (!value) return "Sin actividad";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return formatDate(value);
}

function profileFromUser(user: Session["user"] | undefined): ProfileData {
  const metadata = user?.user_metadata ?? {};
  return {
    ...EMPTY_PROFILE,
    full_name: String(metadata.full_name || metadata.name || ""),
    phone: String(metadata.phone || ""),
    business_name: String(metadata.business_name || ""),
    role: String(metadata.role || ""),
    city: String(metadata.city || ""),
    business_type: String(metadata.business_type || ""),
    business_stage: String(metadata.business_stage || ""),
    main_goal: String(metadata.main_goal || ""),
    preferred_currency: String(metadata.preferred_currency || "ARS"),
  };
}

function StatCard({ label, value, detail, accent = false, onClick }: { label: string; value: string | number; detail: string; accent?: boolean; onClick?: () => void }) {
  const content = <><p className={`text-[11px] font-semibold ${accent ? "text-emerald-100/50" : "text-white/35"}`}>{label}</p><p className={`mt-3 text-3xl font-semibold tracking-tight ${accent ? "text-emerald-100" : "text-white"}`}>{value}</p><p className={`mt-3 text-xs ${accent ? "text-emerald-100/45" : "text-white/30"}`}>{detail}</p></>;
  const className = `rounded-2xl border p-5 text-left transition ${accent ? "border-emerald-300/15 bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,.13),transparent_68%)]" : "border-white/[0.07] bg-white/[0.025]"} ${onClick ? "hover:-translate-y-0.5 hover:border-white/15" : ""}`;
  return onClick ? <button type="button" onClick={onClick} className={className}>{content}</button> : <div className={className}>{content}</div>;
}

export default function ProfilePage({ initialAuthMode = "login" }: { initialAuthMode?: "login" | "signup" }) {
  const configured = Boolean(getSupabaseClient());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(configured);
  const [dataLoading, setDataLoading] = useState(false);
  const [view, setView] = useState<View>("inicio");
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [analysisLoadError, setAnalysisLoadError] = useState(false);
  const [plan, setPlan] = useState<PlanInfo>(FREE_PLAN);
  const [usage, setUsage] = useState<UsageItem[]>(defaultUsage());
  const [editing, setEditing] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [scenarioQuery, setScenarioQuery] = useState("");
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [message, setMessage] = useState(configured ? "" : "Falta configurar Supabase para habilitar el perfil.");
  const paypalReturnHandled = useRef(false);

  function changeView(nextView: View) {
    setView(nextView);
    const nextUrl = nextView === "inicio" ? "/perfil" : `/perfil?view=${nextView}`;
    window.history.replaceState({}, "", nextUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    setDataLoading(true);
    const [scenarioResponse, conversationResponse, planResponse, usageResponse] = await Promise.all([
      supabase.from("saved_scenarios").select("*").order("created_at", { ascending: false }),
      supabase.from("ai_conversations").select("id,title,calculator_name,calculator_path,scenario_id,created_at,updated_at").order("updated_at", { ascending: false }),
      supabase.from("user_plans").select("plan,status,current_period_start,current_period_end,cancel_at_period_end,provider").maybeSingle(),
      supabase.rpc("get_my_usage_summary"),
    ]);
    if (scenarioResponse.error) setMessage("No pudimos cargar los escenarios guardados.");
    else setScenarios((scenarioResponse.data as SavedScenario[]) ?? []);
    if (conversationResponse.error) {
      setConversations([]);
      setAnalysisLoadError(true);
    } else {
      setConversations((conversationResponse.data as Conversation[]) ?? []);
      setAnalysisLoadError(false);
    }

    const planData = planResponse.data as PlanInfo | null;
    const periodEnd = planData?.current_period_end ? new Date(planData.current_period_end).getTime() : null;
    const hasValidEnd = periodEnd === null || (!Number.isNaN(periodEnd) && Date.now() <= periodEnd + PLAN_GRACE_DAYS * 86_400_000);
    const hasValidStatus = planData?.status === "active" || planData?.status === "trialing" || (planData?.status === "past_due" && periodEnd !== null);
    const effectivePlan = planData?.plan === "pro" && hasValidStatus && hasValidEnd && planData ? planData : FREE_PLAN;
    setPlan(effectivePlan);
    const usageData = usageResponse.data as UsageItem[] | null;
    setUsage(!usageResponse.error && usageData?.length ? usageData : defaultUsage(effectivePlan.plan));
    setDataLoading(false);
  }, []);

  const handlePayPalReturn = useCallback(async (activeSession: Session) => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paypal") !== "success" || paypalReturnHandled.current) return;
    paypalReturnHandled.current = true;
    const subscriptionId = params.get("subscription_id");
    window.history.replaceState({}, "", "/perfil?view=plan");
    setView("plan");
    if (!subscriptionId) {
      setMessage("PayPal recibió la aprobación. Estamos esperando la confirmación automática.");
      return;
    }
    setMessage("Confirmando la suscripción con PayPal...");
    try {
      const response = await fetch("/api/paypal/subscriptions/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${activeSession.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      const data = await response.json() as { message?: string; error?: string; active?: boolean };
      setMessage(data.message || data.error || "PayPal está procesando la suscripción.");
      if (response.ok && data.active) await loadData();
    } catch {
      setMessage("El plan se activará cuando llegue la confirmación automática de PayPal.");
    }
  }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get("view");
    if (isView(requestedView)) queueMicrotask(() => setView(requestedView));

    const supabase = getSupabaseClient();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setProfile(profileFromUser(data.session?.user));
      setLoading(false);
      if (data.session) {
        void loadData();
        void handlePayPalReturn(data.session);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setProfile(profileFromUser(nextSession?.user));
      setLoading(false);
      if (nextSession) {
        void loadData();
        void handlePayPalReturn(nextSession);
      } else {
        setScenarios([]);
        setConversations([]);
        setPlan(FREE_PLAN);
        setUsage(defaultUsage());
      }
    });
    return () => data.subscription.unsubscribe();
  }, [handlePayPalReturn, loadData]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) return;
    setSaving(true);
    setMessage("");
    const { data, error } = await supabase.auth.updateUser({ data: profile });
    setSaving(false);
    if (error) setMessage("No pudimos guardar el perfil.");
    else {
      if (data.user) setSession((current) => current ? { ...current, user: data.user } : current);
      setEditing(false);
      setMessage("Tu perfil se actualizó para todo el ecosistema Growtella.");
    }
  }

  async function renameScenario(scenario: SavedScenario) {
    const title = window.prompt("Nuevo nombre para el escenario", scenario.title || "Escenario");
    if (!title?.trim()) return;
    const { error } = await getSupabaseClient()!.from("saved_scenarios").update({ title: title.trim() }).eq("id", scenario.id);
    if (error) setMessage("No pudimos cambiar el nombre.");
    else setScenarios((current) => current.map((item) => item.id === scenario.id ? { ...item, title: title.trim() } : item));
  }

  async function renameAnalysis(conversation: Conversation) {
    const title = window.prompt("Nuevo nombre para el análisis", conversation.title);
    if (!title?.trim()) return;
    const { error } = await getSupabaseClient()!.from("ai_conversations").update({ title: title.trim() }).eq("id", conversation.id);
    if (error) setMessage("No pudimos cambiar el nombre.");
    else setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, title: title.trim() } : item));
  }

  async function removeScenario(id: string) {
    if (!window.confirm("¿Eliminar definitivamente este escenario?")) return;
    const { error } = await getSupabaseClient()!.from("saved_scenarios").delete().eq("id", id);
    if (error) setMessage("No pudimos eliminar el escenario.");
    else setScenarios((current) => current.filter((item) => item.id !== id));
  }

  async function removeAnalysis(id: string) {
    if (!window.confirm("¿Eliminar este análisis y toda su conversación? El escenario vinculado se conservará.")) return;
    const { error } = await getSupabaseClient()!.from("ai_conversations").delete().eq("id", id);
    if (error) setMessage("No pudimos eliminar el análisis.");
    else setConversations((current) => current.filter((item) => item.id !== id));
  }

  const filteredScenarios = useMemo(() => {
    const query = scenarioQuery.trim().toLocaleLowerCase("es");
    if (!query) return scenarios;
    return scenarios.filter((scenario) => {
      const calculator = getCalculatorInfo(scenario.calculator_type);
      return `${scenario.title} ${calculator.name}`.toLocaleLowerCase("es").includes(query);
    });
  }, [scenarioQuery, scenarios]);

  if (loading) return <div className="grid min-h-[65vh] place-items-center text-sm text-white/40">Preparando tu espacio...</div>;
  if (!session) return <main><AuthModal open returnTo="/perfil" initialMode={initialAuthMode} /></main>;

  const user = session.user;
  const name = String(user.user_metadata.full_name || user.user_metadata.name || "Emprendedor/a");
  const initials = name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const completedFields = Object.entries(profile).filter(([key, value]) => key !== "preferred_currency" && Boolean(value)).length;
  const profileProgress = Math.round((completedFields / (Object.keys(profile).length - 1)) * 100);
  const latestScenario = scenarios[0];
  const latestConversation = conversations[0];
  const latestActivity = [latestScenario?.created_at, latestConversation?.updated_at].filter(Boolean).sort().at(-1);

  function renderScenarioCard(scenario: SavedScenario, compact = false) {
    const calculator = getCalculatorInfo(scenario.calculator_type);
    const metrics = getScenarioMetrics(scenario).slice(0, compact ? 2 : 3);
    return <article key={scenario.id} className="group rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/[0.14] hover:bg-white/[0.035] sm:p-6"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-emerald-200/15 bg-emerald-200/[0.07] text-sm font-black text-emerald-100">{calculator.icon}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-emerald-200/55">{calculator.name}</span><span className="text-[10px] text-white/25">{formatRelativeDate(scenario.created_at)}</span></div><h3 className="mt-2 truncate text-lg font-semibold text-white/90">{scenario.title || "Escenario sin nombre"}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-white/35">{getScenarioPreview(scenario)}</p></div></div>{metrics.length > 0 && <div className="mt-5 grid gap-2 sm:grid-cols-3">{metrics.map((metric) => <div key={metric.label} className="min-w-0 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-3"><p className="truncate text-[10px] text-white/30">{metric.label}</p><p className="mt-1 truncate text-sm font-semibold text-white/75">{metric.value}</p></div>)}</div>}<div className="mt-5 flex flex-wrap items-center gap-2"><Link href={`/perfil/escenarios/${scenario.id}`} className="rounded-full bg-emerald-300 px-4 py-2.5 text-sm font-black text-[#052e21] shadow-[0_8px_24px_rgba(110,231,183,.16)] transition hover:bg-emerald-200">Abrir escenario</Link>{!compact && <><button type="button" onClick={() => void renameScenario(scenario)} className="rounded-full border border-white/10 px-3.5 py-2 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white">Renombrar</button><button type="button" onClick={() => void removeScenario(scenario.id)} className="ml-auto rounded-full px-3 py-2 text-xs font-semibold text-red-300/55 hover:bg-red-500/10 hover:text-red-200">Eliminar</button></>}</div></article>;
  }

  function renderAnalysisRow(conversation: Conversation) {
    return <article key={conversation.id} className="group relative rounded-2xl border border-transparent p-3 transition hover:border-white/[0.06] hover:bg-white/[0.025]"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-300/[0.07] text-sm text-emerald-200/70">✦</span><Link href={`/perfil/analisis/${conversation.id}`} className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[.1em] text-white/30">{conversation.calculator_name}</p><h3 className="mt-1 truncate text-sm font-semibold text-white/80 group-hover:text-white">{conversation.title}</h3><p className="mt-1 text-[11px] text-white/25">{formatRelativeDate(conversation.updated_at)} · {conversation.scenario_id ? "Con escenario vinculado" : "Análisis independiente"}</p></Link><button type="button" onClick={() => setOpenMenu((current) => current === conversation.id ? null : conversation.id)} aria-label={`Opciones de ${conversation.title}`} className="grid size-9 shrink-0 place-items-center rounded-full text-sm tracking-[2px] text-white/30 hover:bg-white/[0.07] hover:text-white">•••</button>{openMenu === conversation.id && <div className="absolute right-3 top-14 z-30 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#17181a] p-1.5 text-sm shadow-2xl"><Link href={`/perfil/analisis/${conversation.id}`} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Abrir chat</Link><button type="button" onClick={() => { setOpenMenu(null); void renameAnalysis(conversation); }} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">Renombrar</button>{conversation.scenario_id && <Link href={`/perfil/escenarios/${conversation.scenario_id}`} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Ver escenario</Link>}<div className="my-1 h-px bg-white/[0.07]"/><button type="button" onClick={() => { setOpenMenu(null); void removeAnalysis(conversation.id); }} className="block w-full rounded-lg px-3 py-2 text-left text-red-300/75 hover:bg-red-500/10 hover:text-red-200">Eliminar</button></div>}</div></article>;
  }

  return <main className="profile-shell mx-auto min-h-[78vh] w-full max-w-[90rem] overflow-x-clip px-3 py-5 sm:px-4 sm:py-8">
    <div className="grid w-full min-w-0 max-w-full overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#070a08]/95 shadow-[0_35px_120px_rgba(0,0,0,.28)] backdrop-blur-xl sm:rounded-[2rem] lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="min-w-0 overflow-hidden border-b border-white/[0.07] bg-black/35 p-3 lg:min-h-[780px] lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-3"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-300 text-xs font-black text-[#052e21]">{initials || "CE"}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{name}</p><p className="mt-0.5 truncate text-[11px] text-white/30">{profile.business_name || user.email}</p></div></div>
        <nav className="profile-mobile-nav mt-4 gap-1 lg:block lg:space-y-1">{navigation.map((item) => { const count = item.id === "analisis" ? conversations.length : item.id === "escenarios" ? scenarios.length : 0; return <button key={item.id} type="button" onClick={() => changeView(item.id)} className={`flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition sm:text-sm lg:w-full lg:justify-start ${view === item.id ? "border border-emerald-300/15 bg-emerald-300/[0.08] text-white" : "border border-transparent text-white/60 hover:bg-white/[0.04] hover:text-white"}`}><span className="w-4 shrink-0 text-center text-xs text-emerald-200/70">{item.symbol}</span><span className="min-w-0 truncate">{item.label}</span>{count > 0 && <span className="ml-auto hidden rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] text-white/60 sm:inline">{count}</span>}</button>; })}</nav>
        <div className="mt-4 hidden border-t border-white/[0.07] pt-4 lg:grid lg:gap-1"><Link href="/calculadoras" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 hover:bg-white/[0.04] hover:text-white/75"><span className="w-4 text-center">＋</span>Nueva consulta</Link><a href="https://www.growtella.com/diagnostico" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 hover:bg-white/[0.04] hover:text-white/75"><span className="w-4 text-center">◎</span>Diagnóstico 360°</a></div>
      </aside>

      <div className="min-w-0 max-w-full overflow-hidden p-4 sm:p-8 lg:p-10">
        {message && <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.055] p-4 text-sm text-emerald-50/70"><span>{message}</span><button type="button" onClick={() => setMessage("")} aria-label="Cerrar mensaje" className="text-white/35 hover:text-white">×</button></div>}

        {view === "inicio" && <>
          <header className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="text-xs font-bold text-emerald-200/70">Tu centro de decisiones</p><h1 className="mt-2 break-words text-3xl font-bold tracking-[-.035em] sm:text-4xl">Hola, {name.split(" ")[0]}</h1><p className="mt-3 max-w-xl text-sm font-medium leading-6 text-white/60">Tus cálculos, análisis y próximos pasos reunidos en un solo lugar.</p></div><div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2"><a href="https://www.growtella.com/diagnostico" className="rounded-full border border-white/10 px-4 py-2.5 text-center text-sm font-bold text-white/80 hover:bg-white/5 hover:text-white">Diagnosticar negocio</a><Link href="/calculadoras" className="profile-primary-action rounded-full bg-white px-5 py-2.5 text-center text-sm font-black text-zinc-950 hover:bg-zinc-200">Nueva consulta</Link></div></header>
          <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Escenarios guardados" value={scenarios.length} detail={scenarios.length ? `Último: ${formatRelativeDate(latestScenario?.created_at)}` : "Creá tu primera comparación"} onClick={() => changeView("escenarios")}/><StatCard label="Análisis con IA" value={conversations.length} detail={conversations.length ? `Último: ${formatRelativeDate(latestConversation?.updated_at)}` : "Tu historial aparecerá acá"} onClick={() => changeView("analisis")}/><StatCard label="Plan actual" value={plan.plan === "pro" ? "Pro" : "Gratis"} detail={plan.plan === "pro" ? "Beneficios ampliados activos" : "Podés mejorar cuando lo necesites"} accent onClick={() => changeView("plan")}/><StatCard label="Perfil preparado" value={`${profileProgress}%`} detail={profileProgress === 100 ? "Listo para personalizar resultados" : "Completalo para mejorar la experiencia"} onClick={() => changeView("cuenta")}/></section>
          <section className="mt-9 grid gap-7 xl:grid-cols-[1.18fr_.82fr]"><div><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold text-emerald-200/55">Último escenario</p><h2 className="mt-2 text-xl font-semibold">Continuá donde lo dejaste</h2></div>{latestScenario && <button type="button" onClick={() => changeView("escenarios")} className="text-xs font-semibold text-white/35 hover:text-white">Ver todos →</button>}</div><div className="mt-4">{latestScenario ? renderScenarioCard(latestScenario, true) : <div className="rounded-3xl border border-dashed border-white/10 p-9 text-center"><p className="text-sm text-white/35">Todavía no guardaste ningún escenario.</p><Link href="/calculadoras" className="mt-4 inline-flex rounded-full bg-emerald-300 px-4 py-2.5 text-sm font-black text-[#052e21]">Elegir calculadora</Link></div>}</div></div><div><p className="text-xs font-semibold text-emerald-200/55">Actividad reciente</p><h2 className="mt-2 text-xl font-semibold">Tus análisis</h2><div className="mt-4 space-y-1">{conversations.length ? conversations.slice(0, 4).map(renderAnalysisRow) : <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">Cuando analices un escenario con IA, la conversación aparecerá acá.</div>}</div></div></section>
          <section className="mt-9 grid gap-4 rounded-3xl border border-white/[0.07] bg-[linear-gradient(120deg,rgba(110,231,183,.065),rgba(255,255,255,.018))] p-6 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-xs font-semibold text-emerald-200/55">Estado de tu espacio</p><h2 className="mt-2 text-xl font-semibold">{dataLoading ? "Actualizando información..." : latestActivity ? `Última actividad: ${formatRelativeDate(latestActivity)}` : "Tu espacio está listo"}</h2><p className="mt-2 text-sm leading-6 text-white/38">Tu cuenta, plan y datos son los mismos en todo Growtella.</p></div><a href="https://www.growtella.com/cuenta" className="rounded-full border border-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white/65 hover:bg-white/5 hover:text-white">Abrir cuenta Growtella</a></section>
        </>}

        {view === "analisis" && <><header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="text-xs font-bold text-emerald-200/70">Historial inteligente</p><h1 className="mt-2 break-words text-3xl font-bold tracking-tight">Análisis con IA</h1><p className="mt-2 text-sm font-medium text-white/60">Abrí una conversación exactamente donde la dejaste.</p></div><Link href="/calculadoras" className="profile-primary-action w-full rounded-full bg-white px-4 py-2.5 text-center text-sm font-black text-zinc-950 sm:w-auto">Nuevo análisis</Link></header><section className="mt-8 space-y-3">{analysisLoadError ? <p className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm font-semibold text-amber-50/90">El historial no está disponible temporalmente. Tus calculadoras y escenarios siguen funcionando con normalidad.</p> : conversations.length ? conversations.map(renderAnalysisRow) : <p className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm font-medium text-white/60 sm:p-10">No hay análisis guardados todavía.</p>}</section></>}

        {view === "escenarios" && <><header className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="text-xs font-bold text-emerald-200/70">Biblioteca de cálculos</p><h1 className="mt-2 break-words text-3xl font-bold tracking-tight">Escenarios guardados</h1><p className="mt-2 text-sm font-medium text-white/60">Resultados claros, notas y acceso rápido para volver a calcular.</p></div><Link href="/calculadoras" className="profile-primary-action w-full rounded-full bg-white px-4 py-2.5 text-center text-sm font-black text-zinc-950 sm:w-auto">Crear escenario</Link></header><div className="mt-7 flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/35 px-4"><span className="text-white/60">⌕</span><input value={scenarioQuery} onChange={(event) => setScenarioQuery(event.target.value)} placeholder="Buscar por nombre o calculadora" className="min-w-0 flex-1 bg-transparent py-3.5 text-sm font-semibold text-white outline-none placeholder:text-white/40"/><span className="hidden text-xs text-white/60 sm:inline">{filteredScenarios.length} resultados</span></div><section className="mt-5 grid gap-4 2xl:grid-cols-2">{filteredScenarios.length ? filteredScenarios.map((item) => renderScenarioCard(item)) : <p className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm font-medium text-white/60 sm:p-10 2xl:col-span-2">{scenarios.length ? "No encontramos escenarios con esa búsqueda." : "No hay escenarios guardados todavía."}</p>}</section></>}

        {view === "plan" && <><header><p className="text-xs font-semibold text-emerald-200/60">Suscripción compartida</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Mi plan</h1><p className="mt-2 text-sm text-white/40">Tus beneficios y consumos para todo el ecosistema Growtella.</p></header><section className="relative mt-8 overflow-hidden rounded-[1.7rem] border border-emerald-300/20 bg-[linear-gradient(145deg,rgba(16,185,129,.12),rgba(255,255,255,.025)_55%,rgba(0,0,0,.12))] p-6 sm:p-8"><div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-emerald-300/[0.08] blur-3xl"/><div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><span className="rounded-full border border-emerald-200/20 bg-emerald-200/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[.14em] text-emerald-100">{plan.plan === "pro" ? "Growtella Pro" : "Plan Gratis"}</span>{plan.plan === "pro" && <span className="text-xs text-white/35">Activo</span>}</div><h2 className="mt-5 text-3xl font-semibold tracking-tight">{plan.plan === "pro" ? "Más capacidad para decidir mejor" : "Todo lo esencial para empezar"}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/45">{plan.plan === "pro" ? "Tu cuenta tiene el modelo avanzado y cupos ampliados en las herramientas compatibles." : "Usá las calculadoras, guardá escenarios y probá la IA con límites gratuitos."}</p></div>{plan.plan === "free" && <Link href="/precios" className="relative shrink-0 rounded-full bg-emerald-300 px-5 py-2.5 text-center text-sm font-black text-[#052e21]">Conocer Pro</Link>}</div></section><PlanUsageDashboard plan={plan} usage={usage}/><section className="mt-8 grid gap-4 sm:grid-cols-3">{[["Tus datos siguen siendo tuyos","Cambiar de plan no elimina escenarios ni conversaciones."],["Renovación clara","Siempre ves cuándo se habilita nuevamente cada cupo."],["Una sola membresía","Pro se reconoce en Growtella y sus aplicaciones."]].map(([titleText,copy]) => <div key={titleText} className="rounded-2xl border border-white/[0.07] p-5"><p className="text-sm font-semibold text-white/75">{titleText}</p><p className="mt-2 text-xs leading-5 text-white/35">{copy}</p></div>)}</section></>}

        {view === "cuenta" && <><header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold text-emerald-200/60">Perfil central</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Tu negocio y tu cuenta</h1><p className="mt-2 text-sm text-white/40">Esta información permite personalizar las próximas herramientas.</p></div>{!editing && <button type="button" onClick={() => setEditing(true)} className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-zinc-950">Editar perfil</button>}</header><section className="mt-8 overflow-hidden rounded-3xl border border-white/[0.07]"><div className="grid gap-5 border-b border-white/[0.07] bg-white/[0.025] p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center"><span className="grid size-16 place-items-center rounded-2xl bg-emerald-300 text-lg font-black text-[#052e21]">{initials || "CE"}</span><div><h2 className="text-xl font-semibold">{name}</h2><p className="mt-1 text-sm text-white/35">{profile.business_name || "Completá el nombre de tu emprendimiento"}</p></div><div className="sm:text-right"><p className="text-2xl font-semibold">{profileProgress}%</p><p className="text-xs text-white/30">perfil completo</p></div></div>{editing ? <form onSubmit={saveProfile} className="grid gap-5 p-6 sm:grid-cols-2">{[["full_name","Nombre completo","Tu nombre"],["phone","Teléfono","+54 9..."],["business_name","Nombre del emprendimiento","Tu marca o negocio"],["role","Actividad","Ej. comerciante"],["city","Ciudad","Tu ciudad"]].map(([key,label,placeholder]) => <label key={key} className="grid gap-2 text-xs font-semibold text-white/40">{label}<input value={profile[key as keyof ProfileData]} onChange={(event) => setProfile({ ...profile, [key]: event.target.value })} placeholder={placeholder} className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"/></label>)}<label className="grid gap-2 text-xs font-semibold text-white/40">Tipo de negocio<select value={profile.business_type} onChange={(event) => setProfile({ ...profile, business_type: event.target.value })} className="rounded-2xl border border-white/10 bg-[#111315] px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"><option value="">Elegir</option><option value="Servicios">Servicios</option><option value="Productos">Productos</option><option value="Gastronomía">Gastronomía</option><option value="Digital">Digital</option><option value="Otro">Otro</option></select></label><label className="grid gap-2 text-xs font-semibold text-white/40">Etapa<select value={profile.business_stage} onChange={(event) => setProfile({ ...profile, business_stage: event.target.value })} className="rounded-2xl border border-white/10 bg-[#111315] px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"><option value="">Elegir</option><option value="Idea o validación">Idea o validación</option><option value="Primeras ventas">Primeras ventas</option><option value="Negocio estable">Negocio estable</option><option value="En crecimiento">En crecimiento</option></select></label><label className="grid gap-2 text-xs font-semibold text-white/40">Objetivo principal<input value={profile.main_goal} onChange={(event) => setProfile({ ...profile, main_goal: event.target.value })} placeholder="Ej. mejorar rentabilidad" className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"/></label><label className="grid gap-2 text-xs font-semibold text-white/40">Moneda preferida<select value={profile.preferred_currency} onChange={(event) => setProfile({ ...profile, preferred_currency: event.target.value })} className="rounded-2xl border border-white/10 bg-[#111315] px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"><option value="ARS">Pesos argentinos</option><option value="USD">Dólares</option></select></label><div className="flex flex-wrap gap-2 sm:col-span-2"><button disabled={saving} className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-black text-[#052e21] disabled:opacity-55">{saving ? "Guardando..." : "Guardar cambios"}</button><button type="button" onClick={() => { setEditing(false); setProfile(profileFromUser(user)); }} className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-white/55">Cancelar</button></div></form> : <dl className="grid gap-px bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">{[["Email",user.email],["Teléfono",profile.phone],["Emprendimiento",profile.business_name],["Actividad",profile.role],["Tipo de negocio",profile.business_type],["Etapa",profile.business_stage],["Objetivo",profile.main_goal],["Ciudad",profile.city],["Moneda",profile.preferred_currency]].map(([label,value]) => <div key={label} className="bg-[#0b0c0e] p-5"><dt className="text-[10px] font-semibold uppercase tracking-[.1em] text-white/25">{label}</dt><dd className="mt-2 break-words text-sm font-semibold text-white/70">{value || "Sin completar"}</dd></div>)}</dl>}</section><section className="mt-6 flex flex-col gap-4 rounded-3xl border border-white/[0.07] p-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Seguridad de la cuenta</h2><p className="mt-1 text-xs text-white/35">Cuenta creada el {formatDate(user.created_at)}. Administrá el mismo acceso desde Growtella.</p></div><div className="flex flex-wrap gap-2"><a href="https://www.growtella.com/cuenta" className="rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white">Cuenta Growtella</a><button type="button" onClick={() => getSupabaseClient()?.auth.signOut()} className="rounded-full border border-red-400/20 bg-red-500/[0.06] px-4 py-2.5 text-sm font-semibold text-red-300/75 hover:bg-red-500/10">Cerrar sesión</button></div></section></>}
      </div>
    </div>
  </main>;
}
