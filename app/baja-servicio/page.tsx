import type { Metadata } from "next";

import ConsumerRequestForm from "@/components/ConsumerRequestForm";
import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Botón de baja de servicio",
  description: "Formulario público para solicitar la baja de una suscripción Pro de Calculadora Emprendedora.",
};

export default function BajaServicioPage() {
  return (
    <LegalPageShell
      eyebrow="Suscripciones Pro"
      title="Botón de baja de servicio"
      description="Solicitá la baja de la renovación de Pro sin iniciar sesión. Recibirás un código de identificación al registrar el pedido."
    >
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.055] p-6">
            <h2 className="text-lg font-semibold text-emerald-100">Qué ocurre después</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/55">
              <li>• Registramos el pedido y te mostramos un código de identificación.</li>
              <li>• Localizamos la suscripción con el email y la referencia que proporciones.</li>
              <li>• Podemos verificar razonablemente la identidad para evitar bajas solicitadas por terceros.</li>
              <li>• La baja detiene futuras renovaciones; no elimina automáticamente tu cuenta o historial.</li>
            </ul>
          </section>
          <p className="text-xs leading-5 text-white/35">También podés cancelar el pago automático desde tu cuenta PayPal. Nunca incluyas contraseñas ni datos completos de tarjeta en este formulario.</p>
        </div>
        <ConsumerRequestForm requestType="cancellation" />
      </div>
    </LegalPageShell>
  );
}
