"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

const passwordRequirements = [
  { label: "8 caracteres como mínimo", test: (value: string) => value.length >= 8 },
  { label: "Una letra mayúscula", test: (value: string) => /[A-ZÁÉÍÓÚÜÑ]/.test(value) },
  { label: "Una letra minúscula", test: (value: string) => /[a-záéíóúüñ]/.test(value) },
  { label: "Un número", test: (value: string) => /\d/.test(value) },
];

const inputClassName = "min-h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white outline-none transition hover:border-zinc-700 focus:border-green-600 focus:ring-4 focus:ring-green-600/10";

export default function PasswordRecoveryPage() {
  const configured = Boolean(getSupabaseClient());
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(configured);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(configured ? "" : "La recuperación de acceso no está disponible en este momento.");

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
      setChecking(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
        setChecking(false);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault();
    if (!passwordRequirements.every((requirement) => requirement.test(password))) {
      setMessage("La contraseña todavía no cumple todos los requisitos.");
      return;
    }
    if (password !== confirmation) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSaving(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      setMessage("No pudimos cambiar la contraseña. Pedí un enlace nuevo e intentá otra vez.");
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="calculator-theme min-h-[72vh] px-4 py-10 text-white sm:py-16">
      <section className="mx-auto max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-[#090a09] p-6 text-white shadow-[0_28px_90px_rgba(0,0,0,.5)] sm:p-9">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/[0.05] text-sm font-black text-white">CE</span>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-green-500">Seguridad de la cuenta</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.035em]">Creá una contraseña nueva</h1>

        {checking ? (
          <p className="mt-6 text-sm font-semibold text-white/45">Verificando tu enlace seguro...</p>
        ) : success ? (
          <div className="mt-7">
            <p className="rounded-xl border border-green-600/30 bg-green-600/[0.08] p-4 text-sm font-semibold leading-6 text-green-400">Tu contraseña se actualizó correctamente.</p>
            <Link href="/perfil" className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-green-700 px-4 py-3 text-sm font-black text-white hover:bg-green-600">Ir a mi cuenta</Link>
          </div>
        ) : ready ? (
          <form onSubmit={updatePassword} className="mt-7 grid gap-4">
            <label className="grid gap-2 text-xs font-bold text-white/75">
              Nueva contraseña
              <span className="relative">
                <input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby="recovery-password-rules" className={`${inputClassName} pr-12`} />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-1 right-1 rounded-lg px-3 text-xs font-bold text-zinc-400 hover:bg-white/10 hover:text-white" aria-label={showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}>{showPassword ? "Ocultar" : "Ver"}</button>
              </span>
              <span id="recovery-password-rules" className="grid grid-cols-1 gap-1.5 pt-1 sm:grid-cols-2">
                {passwordRequirements.map((requirement) => {
                  const met = requirement.test(password);
                  return <span key={requirement.label} className={`flex items-center gap-2 text-[11px] font-semibold ${met ? "text-green-500" : "text-white/40"}`}><span className={`grid h-4 w-4 place-items-center rounded-full border text-[9px] ${met ? "border-green-600 bg-green-600 text-white" : "border-white/20"}`}>{met ? "✓" : ""}</span>{requirement.label}</span>;
                })}
              </span>
            </label>
            <label className="grid gap-2 text-xs font-bold text-white/75">
              Confirmar contraseña
              <input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={inputClassName} />
            </label>
            {message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{message}</p>}
            <button disabled={saving} className="mt-1 min-h-12 rounded-xl bg-green-700 px-4 py-3 text-sm font-black text-white hover:bg-green-600 disabled:opacity-55">{saving ? "Guardando..." : "Guardar nueva contraseña"}</button>
          </form>
        ) : (
          <div className="mt-6">
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">{message || "Este enlace venció o ya fue utilizado. Pedí uno nuevo desde la pantalla de ingreso."}</p>
            <Link href="/perfil" className="mt-5 inline-flex text-sm font-black text-green-500 hover:text-green-400">Volver a iniciar sesión →</Link>
          </div>
        )}
      </section>
    </main>
  );
}
