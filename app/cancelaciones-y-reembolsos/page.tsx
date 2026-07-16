import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell, LegalSection } from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Cancelaciones y reembolsos",
  description: "Política de cancelación, baja, arrepentimiento y reembolsos de Calculadora Emprendedora.",
};

export default function CancelacionesPage() {
  return (
    <LegalPageShell
      eyebrow="Suscripciones Pro"
      title="Cancelaciones y reembolsos"
      description="Queremos que sepas cómo detener renovaciones, pedir la baja y solicitar la revisión de un cobro."
      updated="16 de julio de 2026"
    >
      <div className="grid gap-5">
        <LegalSection number="1" title="Cancelar una renovación">
          <p>Podés cancelar la renovación automática desde la administración de pagos automáticos de PayPal o mediante nuestro <Link className="text-emerald-300" href="/baja-servicio">Botón de baja de servicio</Link>. No necesitás iniciar sesión para enviar la solicitud de baja.</p>
        </LegalSection>
        <LegalSection number="2" title="Efecto de la baja">
          <p>La baja detiene cobros futuros. Salvo reembolso o exigencia legal diferente, el acceso Pro continúa hasta finalizar el período ya pagado. El período técnico de gracia no constituye una extensión del plazo contratado.</p>
          <p>Cancelar Pro no elimina tu cuenta, escenarios o conversaciones. La eliminación de datos puede solicitarse por separado desde el canal de privacidad.</p>
        </LegalSection>
        <LegalSection number="3" title="Derecho de arrepentimiento">
          <p>Zella AI recibe solicitudes de revocación dentro de los diez días corridos desde la contratación, sin limitar cualquier plazo mayor o derecho adicional que resulte obligatorio en el país del consumidor. Pueden existir excepciones cuando el servicio ya fue efectivamente utilizado o consumido, según la legislación aplicable.</p>
          <p>La solicitud se presenta desde el <Link className="text-emerald-300" href="/arrepentimiento">Botón de arrepentimiento</Link> y recibe un código de identificación inmediato.</p>
        </LegalSection>
        <LegalSection number="4" title="Reembolsos">
          <p>Los reembolsos legalmente exigibles serán gestionados mediante PayPal al mismo medio de pago cuando sea posible. Fuera de los supuestos obligatorios, las solicitudes se analizan según fecha, uso del servicio, duplicidad, error técnico y demás circunstancias comprobables.</p>
          <p>Los tiempos de acreditación posteriores dependen de PayPal, del emisor de la tarjeta y del medio de pago.</p>
        </LegalSection>
        <LegalSection number="5" title="Pagos fallidos y contracargos">
          <p>Si una renovación falla, PayPal puede reintentar el cobro y el plan puede quedar suspendido o en período de gracia. Si desconocés un pago, contactanos antes de iniciar un contracargo para que podamos identificar y resolver la operación.</p>
        </LegalSection>
        <LegalSection number="6" title="Información necesaria">
          <p>Para localizar una operación podemos solicitar el nombre, email utilizado y referencia de PayPal. Nunca solicitaremos tu contraseña, número completo de tarjeta, código de seguridad ni credenciales bancarias.</p>
        </LegalSection>
        <LegalSection number="7" title="Canal de atención">
          <p>Las solicitudes quedan registradas por el mismo medio y reciben un código. También podés escribir a <a className="text-emerald-300" href="mailto:calculadoraemprendedora@gmail.com">calculadoraemprendedora@gmail.com</a>.</p>
        </LegalSection>
      </div>
    </LegalPageShell>
  );
}
