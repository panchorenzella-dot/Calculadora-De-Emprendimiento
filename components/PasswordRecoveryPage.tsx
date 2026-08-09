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

const inputClassName = "min-h-12 w-full rounded-xl border border-emerald-200/20 bg-[#020a07] px-4 py-3 text-sm text-emerald-50 outline-none transition hover:border-emerald-200/35 focus:border-emerald-300/65 focus:ring-4 focus:ring-emerald-300/[0.08]";

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
      <section className="mx-auto max-w-lg overflow-hidden rounded-[28px] border border-emerald-300/25 bg-[radial-gradient(circle_at_90%_0%,rgba(110,231,183,.13),transparent_23rem),linear-gradient(180deg,#07150f,#05100c)] p-6 shadow-[0_28px_90px_rgba(0,0,0,.5)] sm:p-9">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-200/20 bg-emerald-200/[0.08] text-sm font-black text-emerald-100">CE</span>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/55">Seguridad de la cuenta</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Creá una contraseña nueva</h1>

        {checking ? (
          <p className="mt-6 text-sm text-white/45">Verificando tu enlace seguro...</p>
        ) : success ? (
          <div className="mt-7">
            <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.07] p-4 text-sm leading-6 text-emerald-100/80">Tu contraseña se actualizó correctamente.</p>
            <Link href="/perfil" className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-[#052e21] hover:bg-emerald-200">Ir a mi cuenta</Link>
          </div>
        ) : ready ? (
          <form onSubmit={updatePassword} className="mt-7 grid gap-4">
            <label className="grid gap-2 text-xs font-semibold text-emerald-50/70">
              Nueva contraseña
              <span className="relative">
                <input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby="recovery-password-rules" className={`${inputClassName} pr-12`} />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-1 right-1 rounded-lg px-3 text-xs text-emerald-50/45 hover:bg-emerald-200/[0.08] hover:text-emerald-50" aria-label={showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}>{showPassword ? "Ocultar" : "Ver"}</button>
              </span>
              <span id="recovery-password-rules" className="grid grid-cols-1 gap-1.5 pt-1 sm:grid-cols-2">
                {passwordRequirements.map((requirement) => {
                  const met = requirement.test(password);
                  return <span key={requirement.label} className={`flex items-center gap-2 text-[11px] ${met ? "text-emerald-200" : "text-emerald-50/45"}`}><span className={`grid h-4 w-4 place-items-center rounded-full border text-[9px] ${met ? "border-emerald-300 bg-emerald-300 text-[#043222]" : "border-emerald-200/25"}`}>{met ? "✓" : ""}</span>{requirement.label}</span>;
                })}
              </span>
            </label>
            <label className="grid gap-2 text-xs font-semibold text-emerald-50/70">
              Confirmar contraseña
              <input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={inputClassName} />
            </label>
            {message && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-500/[0.08] p-3 text-sm text-red-100/80">{message}</p>}
            <button disabled={saving} className="mt-1 min-h-12 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-[#052e21] hover:bg-emerald-200 disabled:opacity-55">{saving ? "Guardando..." : "Guardar nueva contraseña"}</button>
          </form>
        ) : (
          <div className="mt-6">
            <p className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-100/75">{message || "Este enlace venció o ya fue utilizado. Pedí uno nuevo desde la pantalla de ingreso."}</p>
            <Link href="/perfil" className="mt-5 inline-flex text-sm font-semibold text-emerald-200">Volver a iniciar sesión →</Link>
          </div>
        )}
      </section>
    </main>
  );
}
