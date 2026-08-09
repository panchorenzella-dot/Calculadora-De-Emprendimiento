"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

type Props = {
  open: boolean;
  onClose?: () => void;
  onAuthenticated?: () => void | Promise<void>;
  returnTo?: string;
  initialMode?: "login" | "signup";
};

type AuthMode = "login" | "signup" | "reset" | "verify";
type LoadingAction = "email" | "google" | "reset" | "resend" | null;
type Feedback = { type: "error" | "success" | "info"; text: string } | null;

const passwordRequirements = [
  { label: "8 caracteres como mínimo", test: (value: string) => value.length >= 8 },
  { label: "Una letra mayúscula", test: (value: string) => /[A-ZÁÉÍÓÚÜÑ]/.test(value) },
  { label: "Una letra minúscula", test: (value: string) => /[a-záéíóúüñ]/.test(value) },
  { label: "Un número", test: (value: string) => /\d/.test(value) },
];

const inputClassName = "min-h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white outline-none transition hover:border-zinc-700 focus:border-green-600 focus:ring-4 focus:ring-green-600/10";

const benefits = [
  {
    title: "Guardá tus cálculos",
    description: "Retomá cada escenario sin volver a cargar los datos.",
  },
  {
    title: "Entendé mejor los resultados",
    description: "Conservá tus análisis y conversaciones con la IA.",
  },
  {
    title: "Un acceso para todo Growtella",
    description: "Tu cuenta te acompaña en las herramientas compatibles.",
  },
];

function safeReturnPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/perfil";
}

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "El email o la contraseña no coinciden. Revisalos e intentá nuevamente.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Primero confirmá tu cuenta desde el email que te enviamos.";
  }
  if (normalized.includes("user already registered")) {
    return "Ese email ya tiene una cuenta. Probá iniciar sesión.";
  }
  if (normalized.includes("password should be")) {
    return "La contraseña no cumple los requisitos de seguridad.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "Hiciste varios intentos seguidos. Esperá unos minutos y volvé a probar.";
  }
  if (normalized.includes("email address") && normalized.includes("invalid")) {
    return "Ingresá un email válido.";
  }

  return "No pudimos completar la operación. Revisá los datos e intentá nuevamente.";
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.37l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.12-1.32.31-1.92V7.46H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.54l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.82 1.5l2.88-2.87A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.46l3.35 2.62C7.18 7.71 9.39 5.95 12 5.95Z" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.7 10.7 0 0 1 12 4c5.2 0 8.5 4.5 9 6.8a4 4 0 0 1 0 2.4 8.8 8.8 0 0 1-2 3.5M6.6 6.6A11 11 0 0 0 3 10.8a4 4 0 0 0 0 2.4C3.5 15.5 6.8 20 12 20c1 0 2-.2 2.8-.5" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10.8C3.5 8.5 6.8 4 12 4s8.5 4.5 9 6.8a4 4 0 0 1 0 2.4C20.5 15.5 17.2 20 12 20s-8.5-4.5-9-6.8a4 4 0 0 1 0-2.4Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m5 10 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AuthModal({
  open,
  onClose,
  onAuthenticated,
  returnTo = "/perfil",
  initialMode = "login",
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<LoadingAction>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [verificationEmail, setVerificationEmail] = useState("");
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const isModal = Boolean(onClose);
  const busy = loading !== null;
  const passwordIsValid = passwordRequirements.every((requirement) => requirement.test(password));

  useEffect(() => {
    if (!open || !isModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModal, onClose, open]);

  if (!open) return null;

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setFeedback(null);
    if (nextMode !== "verify") setVerificationEmail("");
  }

  function getRedirectUrl(path = returnTo) {
    return `${window.location.origin}${safeReturnPath(path)}`;
  }

  async function submitEmail(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) {
      setFeedback({ type: "error", text: "El acceso no está disponible en este momento. Escribinos si el problema continúa." });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFeedback({ type: "error", text: "Ingresá un email válido." });
      return;
    }
    if (!password) {
      setFeedback({ type: "error", text: "Ingresá tu contraseña." });
      return;
    }

    if (mode === "signup") {
      if (fullName.trim().length < 2) {
        setFeedback({ type: "error", text: "Ingresá tu nombre para crear la cuenta." });
        return;
      }
      if (!passwordIsValid) {
        setFeedback({ type: "error", text: "La contraseña todavía no cumple todos los requisitos." });
        return;
      }
      if (password !== confirmPassword) {
        setFeedback({ type: "error", text: "Las contraseñas no coinciden." });
        return;
      }
    }

    setLoading("email");
    setFeedback(null);

    const response = mode === "login"
      ? await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      : await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: getRedirectUrl(),
            data: { full_name: fullName.trim() },
          },
        });

    setLoading(null);

    if (response.error) {
      setFeedback({ type: "error", text: translateAuthError(response.error.message) });
      return;
    }

    if (mode === "signup" && !response.data.session) {
      setVerificationEmail(cleanEmail);
      setMode("verify");
      setFeedback(null);
      return;
    }

    setFeedback({ type: "success", text: "Listo, ya ingresaste a tu cuenta." });
    await onAuthenticated?.();
  }

  async function resendVerification() {
    const supabase = getSupabaseClient();
    if (!supabase || !verificationEmail) return;

    setLoading("resend");
    setFeedback(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: verificationEmail,
      options: { emailRedirectTo: getRedirectUrl() },
    });
    setLoading(null);

    if (error) {
      setFeedback({ type: "error", text: translateAuthError(error.message) });
      return;
    }

    setFeedback({ type: "success", text: "Listo. Te enviamos un enlace nuevo." });
  }

  async function requestPasswordReset(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) {
      setFeedback({ type: "error", text: "El acceso no está disponible en este momento. Escribinos si el problema continúa." });
      return;
    }

    setLoading("reset");
    setFeedback(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setLoading(null);
      setFeedback({ type: "error", text: "Ingresá un email válido." });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: getRedirectUrl("/restablecer-contrasena"),
    });
    setLoading(null);

    if (error) {
      setFeedback({ type: "error", text: translateAuthError(error.message) });
      return;
    }

    setFeedback({
      type: "success",
      text: `Si existe una cuenta con ${cleanEmail}, vas a recibir un enlace para crear una contraseña nueva.`,
    });
  }

  async function signInWithGoogle() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setFeedback({ type: "error", text: "El acceso con Google no está disponible en este momento." });
      return;
    }

    setLoading("google");
    setFeedback({ type: "info", text: "Conectando de forma segura con Google..." });

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getRedirectUrl(),
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error("missing-oauth-url");
      window.location.assign(data.url);
    } catch (error) {
      setLoading(null);
      setFeedback({
        type: "error",
        text: error instanceof Error && error.message !== "missing-oauth-url"
          ? translateAuthError(error.message)
          : "No pudimos abrir Google. Intentá nuevamente o usá tu email.",
      });
    }
  }

  const title = mode === "login"
    ? "Volvé a tu espacio"
    : mode === "signup"
      ? "Creá tu cuenta gratis"
      : mode === "verify"
        ? "Revisá tu email"
        : "Recuperá tu acceso";
  const description = mode === "login"
    ? "Accedé a tus escenarios, análisis y herramientas desde cualquier dispositivo."
    : mode === "signup"
      ? "Empezá gratis y conservá todo el trabajo que hagas en la calculadora."
      : mode === "verify"
        ? "Te enviamos un enlace de confirmación. Tu cuenta se activa cuando verificás tu dirección."
        : "Ingresá tu email y te enviaremos un enlace seguro para elegir una contraseña nueva.";

  const card = (
    <div
      ref={dialogRef}
      role={isModal ? "dialog" : undefined}
      aria-modal={isModal || undefined}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={isModal ? -1 : undefined}
      className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#080908] shadow-[0_30px_100px_rgba(0,0,0,0.62)] outline-none lg:grid lg:grid-cols-[0.84fr_1.16fr]"
    >
      <aside className="relative hidden min-h-full overflow-hidden border-r border-white/10 bg-[linear-gradient(145deg,rgba(22,163,74,.11),rgba(8,9,8,.98)_52%,#050605)] p-9 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-green-600/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/[0.05] font-black text-white">CE</span>
          <div>
            <p className="font-black tracking-tight text-white">Calculadora Emprendedora</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.17em] text-green-500/70">por Growtella</p>
          </div>
        </div>

        <div className="relative my-auto py-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-500/75">Tu espacio de trabajo</p>
          <h2 className="mt-4 max-w-sm text-3xl font-black leading-tight tracking-[-0.035em] text-white">
            Tus decisiones, ordenadas en un solo lugar.
          </h2>
          <div className="mt-8 space-y-5">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-green-600/40 bg-green-600/10 text-green-500">
                  <CheckIcon />
                </span>
                <div>
                  <p className="text-sm font-bold text-white/90">{benefit.title}</p>
                  <p className="mt-1 text-xs font-medium leading-5 text-white/48">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-xs font-semibold text-white/45">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
          Gratis para empezar · Sin tarjeta
        </div>
      </aside>

      <section className="relative bg-[#090a09] px-5 py-6 text-white sm:px-9 sm:py-8 lg:px-12 lg:py-10">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar acceso"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 text-xl leading-none text-white/45 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50 sm:right-6 sm:top-6"
          >
            ×
          </button>
        )}

        <div className={onClose ? "pr-11" : ""}>
          <div className="flex items-center gap-2 text-xs font-bold text-white/75 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/15 bg-white/[0.05] text-[10px] font-black text-white">CE</span>
            Calculadora Emprendedora
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-green-500 lg:mt-0">Cuenta Growtella</p>
          <h1 id={titleId} className="mt-2 text-3xl font-black tracking-[-0.035em] text-white sm:text-[2rem]">{title}</h1>
          <p id={descriptionId} className="mt-3 max-w-lg text-sm font-medium leading-6 text-white/55">{description}</p>
        </div>

        {mode !== "reset" && mode !== "verify" && (
          <div className="mt-7 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.06] p-1" aria-label="Elegir tipo de acceso">
            <button
              type="button"
              onClick={() => changeMode("login")}
              aria-pressed={mode === "login"}
              className={`rounded-lg px-3 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50 ${mode === "login" ? "bg-black text-white shadow-sm" : "text-white/45 hover:text-white"}`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => changeMode("signup")}
              aria-pressed={mode === "signup"}
              className={`rounded-lg px-3 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50 ${mode === "signup" ? "bg-black text-white shadow-sm" : "text-white/45 hover:text-white"}`}
            >
              Crear cuenta
            </button>
          </div>
        )}

        {mode !== "reset" && mode !== "verify" && (
          <>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={busy}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-950 shadow-sm transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090a09] disabled:cursor-wait disabled:opacity-60"
            >
              {loading === "google" ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" aria-hidden="true" />
              ) : (
                <GoogleIcon />
              )}
              {loading === "google" ? "Abriendo Google..." : mode === "signup" ? "Registrarme con Google" : "Continuar con Google"}
            </button>
            <p className="mt-2 text-center text-[11px] font-semibold text-white/38">La opción más rápida · No necesitás otra contraseña</p>

            <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white/30">
              <span className="h-px flex-1 bg-white/10" />
              o usar email
              <span className="h-px flex-1 bg-white/10" />
            </div>
          </>
        )}

        {mode === "verify" && (
          <div className="mt-7 rounded-2xl border border-green-600/30 bg-green-600/[0.08] p-5">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-green-700 text-xl font-black text-white" aria-hidden="true">✓</div>
            <p className="mt-4 text-sm font-black text-white">Enlace de verificación enviado</p>
            <p className="mt-2 break-words text-sm font-medium leading-6 text-white/60">Mandamos el email a <strong className="font-black text-green-400">{verificationEmail}</strong>. Abrí el enlace para activar la cuenta y después vas a poder ingresar.</p>
            <p className="mt-3 text-xs font-semibold leading-5 text-white/40">Si no aparece, revisá Spam o Correo no deseado. El enlace puede tardar unos minutos.</p>
            {feedback && (
              <p role={feedback.type === "error" ? "alert" : "status"} className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${feedback.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-white text-green-800"}`}>{feedback.text}</p>
            )}
            <button type="button" disabled={busy} onClick={resendVerification} className="mt-5 min-h-11 w-full rounded-xl border border-green-600/50 px-4 py-2.5 text-sm font-black text-green-400 transition hover:bg-green-600/10 disabled:cursor-wait disabled:opacity-50">
              {loading === "resend" ? "Reenviando..." : "Reenviar email"}
            </button>
            <button type="button" onClick={() => changeMode("signup")} className="mt-3 w-full text-center text-xs font-bold text-white/45 hover:text-white">Usar otro email</button>
          </div>
        )}

        {mode !== "verify" && <form onSubmit={mode === "reset" ? requestPasswordReset : submitEmail} className="grid gap-4" noValidate>
          {mode === "signup" && (
            <label className="grid gap-2">
              <span className="text-xs font-bold text-white/75">Nombre</span>
              <input
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className={inputClassName}
              />
            </label>
          )}

          <label className="grid gap-2">
            <span className="text-xs font-bold text-white/75">Email</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
          </label>

          {mode !== "reset" && (
            <label className="grid gap-2">
              <span className="flex items-center justify-between gap-3 text-xs font-bold text-white/75">
                Contraseña
                {mode === "login" && (
                  <button type="button" onClick={() => changeMode("reset")} className="font-bold text-green-500 transition hover:text-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50">
                    ¿La olvidaste?
                  </button>
                )}
              </span>
              <span className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={mode === "signup" ? 8 : 6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-describedby={mode === "signup" ? `${titleId}-password-rules` : undefined}
                  className={`${inputClassName} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-1 right-1 grid w-10 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/40"
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </span>
              {mode === "signup" && (
                <span id={`${titleId}-password-rules`} className="grid grid-cols-1 gap-1.5 pt-1 sm:grid-cols-2">
                  {passwordRequirements.map((requirement) => {
                    const met = requirement.test(password);
                    return <span key={requirement.label} className={`flex items-center gap-2 text-[11px] font-semibold ${met ? "text-green-500" : "text-white/40"}`}><span className={`grid h-4 w-4 place-items-center rounded-full border text-[9px] ${met ? "border-green-600 bg-green-600 text-white" : "border-white/20"}`}>{met ? "✓" : ""}</span>{requirement.label}</span>;
                  })}
                </span>
              )}
            </label>
          )}

          {mode === "signup" && (
            <label className="grid gap-2">
              <span className="text-xs font-bold text-white/75">Confirmar contraseña</span>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClassName}
              />
            </label>
          )}

          {feedback && (
            <div
              role={feedback.type === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`rounded-xl border px-4 py-3 text-sm font-semibold leading-5 ${
                feedback.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : feedback.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-blue-200 bg-blue-50 text-blue-800"
              }`}
            >
              {feedback.text}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 flex min-h-12 items-center justify-center rounded-xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-[0_10px_26px_rgba(21,128,61,.18)] transition hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090a09] disabled:cursor-wait disabled:opacity-55"
          >
            {loading === "email" || loading === "reset"
              ? "Procesando..."
              : mode === "login"
                ? "Ingresar a mi cuenta"
                : mode === "signup"
                  ? "Crear mi cuenta gratis"
                  : "Enviar enlace de recuperación"}
          </button>
          {mode === "signup" && <p className="text-center text-[11px] font-semibold leading-5 text-white/40">Te enviaremos un email para verificar tu dirección antes de activar la cuenta.</p>}
        </form>}

        {mode === "reset" ? (
          <button type="button" onClick={() => changeMode("login")} className="mt-5 w-full text-center text-sm font-bold text-green-500 transition hover:text-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/50">
            ← Volver a iniciar sesión
          </button>
        ) : mode !== "verify" ? (
          <p className="mt-5 text-center text-[11px] font-medium leading-5 text-white/35">
            Al continuar aceptás los <Link href="/terminos-y-condiciones" className="font-bold underline decoration-white/20 underline-offset-2 hover:text-white">Términos</Link> y la <Link href="/politica-de-privacidad" className="font-bold underline decoration-white/20 underline-offset-2 hover:text-white">Política de privacidad</Link>.
          </p>
        ) : null}
      </section>
    </div>
  );

  if (!isModal) {
    return (
      <div className="mx-auto flex min-h-[72vh] w-full max-w-6xl items-center justify-center px-4 py-8 sm:py-12">
        {card}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[150] overflow-y-auto bg-black/78 px-3 py-4 backdrop-blur-md sm:px-5 sm:py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="flex min-h-full items-center justify-center">{card}</div>
    </div>
  );
}
