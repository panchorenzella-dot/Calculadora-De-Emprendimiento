import type { Metadata } from "next";

import ConsumerRequestForm from "@/components/ConsumerRequestForm";
import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Botón de arrepentimiento",
  description: "Formulario público para solicitar la revocación de una contratación realizada en Calculadora Emprendedora.",
};

export default function ArrepentimientoPage() {
  return (
    <LegalPageShell
      eyebrow="Derecho del consumidor"
      title="Botón de arrepentimiento"
      description="Podés registrar una solicitud de revocación sin crear una cuenta ni iniciar sesión. Al enviarla recibirás inmediatamente un código de identificación."
    >
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.055] p-6">
            <h2 className="text-lg font-semibold text-emerald-100">Antes de comenzar</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/55">
              <li>• Zella AI recibe solicitudes dentro de los 10 días corridos desde la contratación, sin limitar plazos mayores reconocidos en tu país.</li>
              <li>• La legislación aplicable puede contemplar excepciones, por ejemplo cuando el servicio fue efectivamente utilizado o consumido.</li>
              <li>• No necesitás iniciar sesión ni realizar trámites adicionales para registrar el pedido.</li>
              <li>• Podremos aplicar verificaciones razonables únicamente para confirmar identidad y seguridad.</li>
            </ul>
          </section>
          <p className="text-xs leading-5 text-white/35">La evaluación final de cada solicitud depende de las circunstancias de la contratación y de la legislación aplicable al consumidor.</p>
        </div>
        <ConsumerRequestForm requestType="withdrawal" />
      </div>
    </LegalPageShell>
  );
}
