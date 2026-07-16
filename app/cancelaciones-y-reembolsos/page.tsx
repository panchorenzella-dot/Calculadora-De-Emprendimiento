import type { Metadata } from "next";

import { LegalPageShell, LegalSection } from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Cancelaciones y reembolsos",
  description: "Política de cancelaciones y reembolsos de Calculadora Emprendedora.",
};

export default function CancelacionesPage() {
  return (
    <LegalPageShell
      eyebrow="Suscripciones Pro"
      title="Cancelaciones y reembolsos"
      description="Conocé cómo detener futuras renovaciones y solicitar la revisión de un cobro."
      updated="16 de julio de 2026"
    >
      <div className="grid gap-5">
        <LegalSection number="1" title="Cancelar una renovación">
          <p>Podés cancelar la renovación automática desde la administración de pagos automáticos de PayPal. Si necesitás ayuda, escribinos a <a className="text-emerald-300" href="mailto:calculadoraemprendedora@gmail.com">calculadoraemprendedora@gmail.com</a>.</p>
        </LegalSection>
        <LegalSection number="2" title="Efecto de la cancelación">
          <p>La cancelación detiene cobros futuros. Salvo reembolso o exigencia legal diferente, el acceso Pro continúa hasta finalizar el período ya pagado. El período técnico de gracia no constituye una extensión del plazo contratado.</p>
          <p>Cancelar Pro no elimina tu cuenta, escenarios o conversaciones. La eliminación de datos puede solicitarse por separado desde el canal de privacidad.</p>
        </LegalSection>
        <LegalSection number="3" title="Reembolsos">
          <p>Los reembolsos legalmente exigibles serán gestionados mediante PayPal al mismo medio de pago cuando sea posible. Fuera de los supuestos obligatorios, las solicitudes se analizan según fecha, uso del servicio, duplicidad, error técnico y demás circunstancias comprobables.</p>
          <p>Los tiempos de acreditación posteriores dependen de PayPal, del emisor de la tarjeta y del medio de pago.</p>
        </LegalSection>
        <LegalSection number="4" title="Pagos fallidos y contracargos">
          <p>Si una renovación falla, PayPal puede reintentar el cobro y el plan puede quedar suspendido o en período de gracia. Si desconocés un pago, contactanos antes de iniciar un contracargo para que podamos identificar y resolver la operación.</p>
        </LegalSection>
        <LegalSection number="5" title="Información necesaria">
          <p>Para localizar una operación podemos solicitar el nombre, email utilizado y referencia de PayPal. Nunca solicitaremos tu contraseña, número completo de tarjeta, código de seguridad ni credenciales bancarias.</p>
        </LegalSection>
        <LegalSection number="6" title="Canal de atención">
          <p>Para solicitar la revisión de un cobro o consultar el estado de un reembolso, escribí a <a className="text-emerald-300" href="mailto:calculadoraemprendedora@gmail.com">calculadoraemprendedora@gmail.com</a>.</p>
        </LegalSection>
      </div>
    </LegalPageShell>
  );
}
