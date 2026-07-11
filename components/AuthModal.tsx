"use client";

import { useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

type Props = {
  open: boolean;
  onClose?: () => void;
  onAuthenticated?: () => void | Promise<void>;
  returnTo?: string;
};

export default function AuthModal({
  open,
  onClose,
  onAuthenticated,
  returnTo = "/perfil",
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function submitEmail(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Falta configurar Supabase en las variables de entorno.");
      return;
    }

    setLoading(true);
    setMessage("");

    const response =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    if (mode === "signup" && !response.data.session) {
      setMessage("Revisá tu email para confirmar la cuenta y después ingresá.");
      return;
    }

    setMessage("Sesión iniciada correctamente.");
    await onAuthenticated?.();
  }

  async function signInWithGoogle() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Falta configurar Supabase en las variables de entorno.");
      return;
    }

    setLoading(true);
    setMessage("Abriendo Google...");
    const redirectTo = `${window.location.origin}${returnTo}`;
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error) throw error;
      if (!data.url) throw new Error("Supabase no devolvió una URL de acceso.");

      window.location.assign(data.url);
    } catch (error) {
      setLoading(false);
      setMessage(
        error instanceof Error
          ? `No se pudo abrir Google: ${error.message}`
          : "No se pudo iniciar sesión con Google."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/75">
              Cuenta gratuita
            </p>
            <h2 id="auth-title" className="mt-2 text-2xl font-bold">
              Guardá tus escenarios
            </h2>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-lg px-3 py-2 text-white/55 hover:bg-white/5 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        <p className="mt-3 text-sm leading-6 text-white/60">
          Creá una cuenta gratis para guardar este escenario y volver después
          desde cualquier dispositivo.
        </p>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="mt-6 w-full rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-60"
        >
          Continuar con Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-white/35">
          <span className="h-px flex-1 bg-white/10" /> o con email
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={submitEmail} className="grid gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-white/30"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Contraseña"
            className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-white/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          >
            {loading
              ? "Procesando..."
              : mode === "login"
                ? "Ingresar"
                : "Crear cuenta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setMessage("");
          }}
          className="mt-4 text-sm text-white/55 hover:text-white"
        >
          {mode === "login"
            ? "¿No tenés cuenta? Crear una"
            : "Ya tengo cuenta"}
        </button>

        {message && (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
