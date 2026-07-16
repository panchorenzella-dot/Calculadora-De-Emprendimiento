import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell, LegalSection } from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo Calculadora Emprendedora y Zella AI tratan la información de sus usuarios.",
};

export default function PoliticaPage() {
  return (
    <LegalPageShell
      eyebrow="Transparencia y confianza"
      title="Política de privacidad"
      description="Te contamos de forma clara qué información usamos, por qué la necesitamos y qué opciones tenés sobre tus datos."
      updated="16 de julio de 2026"
    >
      <div className="grid gap-5">
        <LegalSection number="1" title="Responsable y contacto">
          <p>Calculadora Emprendedora es un servicio digital identificado comercialmente como Zella AI. Para consultas sobre privacidad escribí a <a className="text-emerald-300" href="mailto:calculadoraemprendedora@gmail.com">calculadoraemprendedora@gmail.com</a>.</p>
        </LegalSection>
        <LegalSection number="2" title="Qué información tratamos">
          <p>Si creás una cuenta, tratamos tu email y los datos que decidas completar en tu perfil. Si guardás un escenario, almacenamos su nombre, los valores ingresados y los resultados. También conservamos conversaciones y datos de uso necesarios para aplicar los límites del plan.</p>
        </LegalSection>
        <LegalSection number="3" title="Cómo usamos la información">
          <p>Usamos esos datos para autenticarte, prestar las funciones, conservar tu historial, proteger la plataforma, administrar planes, procesar pagos y atender solicitudes. No vendemos tu información personal.</p>
        </LegalSection>
        <LegalSection number="4" title="Cálculos e inteligencia artificial">
          <p>Podés usar las calculadoras sin guardar escenarios. Cuando solicitás un análisis o enviás mensajes al asistente, compartimos con OpenAI los datos de la calculadora, sus resultados y el texto necesario para generar la respuesta.</p>
          <p>No incluyas contraseñas, datos bancarios ni información sensible. Las respuestas son orientativas y no reemplazan asesoramiento profesional.</p>
        </LegalSection>
        <LegalSection number="5" title="Pagos y suscripciones">
          <p>PayPal procesa los pagos y administra la autorización de las suscripciones. Zella AI recibe identificadores, estado, período y eventos necesarios para activar, renovar, suspender, cancelar o reembolsar Pro. No recibimos ni almacenamos el número completo de tu tarjeta ni tus credenciales bancarias.</p>
        </LegalSection>
        <LegalSection number="6" title="Solicitudes del consumidor">
          <p>Si utilizás los botones de arrepentimiento o baja, guardamos nombre, email, referencia opcional, detalle, código, estado y fecha del trámite. Para limitar abusos conservamos un valor hash de la dirección técnica de origen, no la dirección IP en bruto.</p>
        </LegalSection>
        <LegalSection number="7" title="Proveedores de servicio">
          <p>Utilizamos Supabase para autenticación y datos; OpenAI para respuestas de IA; Vercel para alojamiento; y PayPal para pagos. Cada proveedor trata información para prestar su servicio y aplica sus propias condiciones y medidas de seguridad.</p>
        </LegalSection>
        <LegalSection number="8" title="Cookies y almacenamiento local">
          <p>Usamos cookies o almacenamiento necesarios para mantener la sesión, completar el ingreso y recordar información temporal. Si incorporamos medición o publicidad no esencial, actualizaremos esta política y aplicaremos los controles que correspondan.</p>
        </LegalSection>
        <LegalSection number="9" title="Tus opciones">
          <p>Podés editar tu perfil, eliminar escenarios y conversaciones, cerrar sesión y solicitar acceso, corrección o eliminación de datos. La baja de Pro no elimina automáticamente la cuenta. Algunas constancias pueden conservarse para cumplir obligaciones legales, prevenir fraude o resolver reclamos.</p>
        </LegalSection>
        <LegalSection number="10" title="Seguridad y conservación">
          <p>Aplicamos controles razonables para que cada usuario acceda a sus propios datos y separamos las claves privadas del navegador. Conservamos la información mientras la cuenta esté activa o durante el tiempo necesario para prestar el servicio y cumplir obligaciones.</p>
        </LegalSection>
        <LegalSection number="11" title="Cambios en esta política">
          <p>Podemos actualizar esta política cuando cambien funciones, proveedores o prácticas. La versión vigente y su fecha estarán publicadas aquí.</p>
        </LegalSection>
      </div>
      <section className="mt-10 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-7">
        <p className="text-sm font-semibold text-emerald-300">¿Tenés una consulta sobre tus datos?</p>
        <p className="mt-3 text-white/60">Escribinos por email o visitá el canal de contacto.</p>
        <Link href="/contacto" className="mt-5 inline-block text-sm font-semibold text-emerald-300">Ir a contacto →</Link>
      </section>
    </LegalPageShell>
  );
}
