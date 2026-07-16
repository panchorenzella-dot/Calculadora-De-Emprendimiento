"use client";

import { useState } from "react";

type RequestType = "withdrawal" | "cancellation";

const fieldClass = "mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-emerald-300/45";

export default function ConsumerRequestForm({ requestType }: { requestType: RequestType }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/consumer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          fullName: form.get("fullName"),
          email: form.get("email"),
          reference: form.get("reference"),
          details: form.get("details"),
          website: form.get("website"),
        }),
      });
      const data = await response.json() as { code?: string; error?: string };
      if (!response.ok || !data.code) {
        setError(data.error || "No pudimos registrar la solicitud. Intentá nuevamente.");
        return;
      }
      setCode(data.code);
    } catch {
      setError("No pudimos conectar con el sistema. También podés escribirnos por email.");
    } finally {
      setLoading(false);
    }
  }

  if (code) {
    return (
      <section role="status" className="rounded-3xl border border-emerald-300/25 bg-emerald-300/[0.07] p-7">
        <p className="text-sm font-semibold text-emerald-200">Solicitud registrada</p>
        <p className="mt-3 text-sm leading-6 text-white/60">Guardá este código. Identifica tu trámite y también fue asociado al email informado.</p>
        <p className="mt-5 break-all rounded-2xl border border-emerald-300/20 bg-black/35 px-5 py-4 font-mono text-lg font-bold tracking-wider text-emerald-200">{code}</p>
        <p className="mt-4 text-xs leading-5 text-white/45">Zella AI procesará la solicitud y podrá contactarte únicamente para verificar razonablemente la identidad o la operación.</p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-white/75">
          Nombre y apellido
          <input className={fieldClass} name="fullName" required minLength={2} maxLength={120} autoComplete="name" placeholder="Como figura en la compra" />
        </label>
        <label className="text-sm font-medium text-white/75">
          Email utilizado en la compra
          <input className={fieldClass} name="email" required type="email" maxLength={200} autoComplete="email" placeholder="nombre@email.com" />
        </label>
      </div>
      <label className="mt-5 block text-sm font-medium text-white/75">
        Identificador de suscripción o pago <span className="font-normal text-white/35">(opcional)</span>
        <input className={fieldClass} name="reference" maxLength={120} placeholder="Por ejemplo: I-XXXXXXXX" />
      </label>
      <label className="mt-5 block text-sm font-medium text-white/75">
        Información adicional <span className="font-normal text-white/35">(opcional)</span>
        <textarea className={`${fieldClass} min-h-28 resize-y`} name="details" maxLength={1000} placeholder={requestType === "cancellation" ? "Indicá cualquier dato que ayude a identificar la suscripción." : "Indicá la fecha aproximada y el plan contratado."} />
      </label>
      <label className="absolute -left-[9999px]" aria-hidden="true">
        Sitio web
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {error && <p role="alert" className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/[0.06] px-4 py-3 text-sm text-red-100">{error} Escribinos a <a className="underline" href="mailto:calculadoraemprendedora@gmail.com">calculadoraemprendedora@gmail.com</a>.</p>}
      <button disabled={loading} className="mt-6 w-full rounded-full bg-emerald-300 px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-60" type="submit">
        {loading ? "Registrando solicitud..." : requestType === "cancellation" ? "Solicitar baja del servicio" : "Ejercer derecho de arrepentimiento"}
      </button>
      <p className="mt-4 text-center text-xs leading-5 text-white/35">No necesitás iniciar sesión. No incluyas contraseñas, datos bancarios ni información sensible.</p>
    </form>
  );
}
