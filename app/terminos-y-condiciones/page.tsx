import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell, LegalSection } from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Condiciones de uso y contratación de Calculadora Emprendedora, un servicio de Zella AI.",
};

export default function TerminosPage() {
  return (
    <LegalPageShell
      eyebrow="Condiciones claras"
      title="Términos y condiciones"
      description="Estas reglas explican cómo funciona Calculadora Emprendedora, qué incluye cada plan y cuáles son los derechos y responsabilidades al utilizar el servicio."
      updated="16 de julio de 2026"
    >
      <div className="grid gap-5">
        <LegalSection number="1" title="Identificación del servicio">
          <p>Calculadora Emprendedora es un servicio digital operado bajo la denominación comercial Zella AI. El canal de atención es <a className="text-emerald-300 hover:text-emerald-200" href="mailto:calculadoraemprendedora@gmail.com">calculadoraemprendedora@gmail.com</a>.</p>
          <p>La información legal y fiscal aplicable al responsable de la contratación se encontrará en los comprobantes correspondientes o podrá solicitarse por el canal de contacto, conforme la normativa aplicable.</p>
        </LegalSection>
        <LegalSection number="2" title="Aceptación y capacidad">
          <p>Al crear una cuenta, utilizar las funciones con inteligencia artificial o contratar Pro, aceptás estos términos y las políticas vinculadas. Debés tener capacidad legal suficiente para contratar o contar con autorización de quien ejerza tu representación.</p>
        </LegalSection>
        <LegalSection number="3" title="Alcance de las herramientas">
          <p>Las calculadoras, comparaciones y respuestas de inteligencia artificial son herramientas informativas y orientativas. Pueden contener aproximaciones o errores y no sustituyen asesoramiento contable, financiero, impositivo, jurídico ni profesional.</p>
          <p>Las decisiones comerciales y financieras siguen siendo responsabilidad del usuario, quien debe revisar los datos ingresados y validar los resultados relevantes.</p>
        </LegalSection>
        <LegalSection number="4" title="Cuenta y uso permitido">
          <p>Sos responsable de mantener seguras tus credenciales y de la actividad realizada desde tu cuenta. No está permitido vulnerar límites, automatizar solicitudes abusivas, acceder a cuentas ajenas, alterar el servicio ni utilizarlo para fines ilegales o fraudulentos.</p>
          <p>Podemos limitar o suspender el acceso cuando resulte necesario para proteger usuarios, infraestructura, proveedores o cumplir obligaciones legales.</p>
        </LegalSection>
        <LegalSection number="5" title="Planes y límites">
          <p>El plan Gratis ofrece las funciones y cupos publicados en la página de precios. El plan Pro amplía análisis y mensajes, habilita escenarios ilimitados y utiliza el modelo de IA indicado en la plataforma.</p>
          <p>Los límites se renuevan según el período informado. Podemos ajustar funciones o cupos futuros, pero los cambios materiales se comunicarán y no reducirán retroactivamente un período Pro ya pagado.</p>
        </LegalSection>
        <LegalSection number="6" title="Precios, moneda y renovación">
          <p>Los planes Pro se cobran por adelantado en dólares estadounidenses mediante PayPal. El precio, período y renovación automática se muestran antes de confirmar la suscripción. PayPal o el emisor del medio de pago pueden aplicar conversión, comisiones o impuestos fuera del control de Zella AI.</p>
          <p>La suscripción se renueva automáticamente hasta su cancelación. Un pago fallido puede generar suspensión, reintentos de cobro y un período técnico de gracia de hasta dos días, sin extender el período contratado.</p>
        </LegalSection>
        <LegalSection number="7" title="Cancelación, baja y arrepentimiento">
          <p>Podés cancelar futuras renovaciones desde PayPal o utilizar el <Link className="text-emerald-300 hover:text-emerald-200" href="/baja-servicio">Botón de baja de servicio</Link>, sin necesidad de iniciar sesión. La baja no elimina automáticamente tu cuenta ni tus datos guardados.</p>
          <p>También podés ejercer el derecho aplicable desde el <Link className="text-emerald-300 hover:text-emerald-200" href="/arrepentimiento">Botón de arrepentimiento</Link>. Las condiciones de devolución y excepciones se detallan en la <Link className="text-emerald-300 hover:text-emerald-200" href="/cancelaciones-y-reembolsos">política de cancelaciones y reembolsos</Link>.</p>
        </LegalSection>
        <LegalSection number="8" title="Disponibilidad y proveedores">
          <p>El servicio depende de internet y de proveedores como Vercel, Supabase, OpenAI y PayPal. Podemos realizar mantenimiento o enfrentar interrupciones fuera de nuestro control. Aplicamos esfuerzos razonables para restablecer el servicio, sin garantizar disponibilidad ininterrumpida.</p>
        </LegalSection>
        <LegalSection number="9" title="Propiedad intelectual">
          <p>El diseño, textos, marca, estructura, software y contenidos propios están protegidos por las normas aplicables. Conservás la titularidad de los datos que ingresás, sin perjuicio de las autorizaciones técnicas necesarias para procesarlos y prestar el servicio.</p>
        </LegalSection>
        <LegalSection number="10" title="Privacidad">
          <p>El tratamiento de datos personales se explica en la <Link className="text-emerald-300 hover:text-emerald-200" href="/politica-de-privacidad">Política de privacidad</Link>. No ingreses contraseñas, datos bancarios ni información sensible en las calculadoras o conversaciones con IA.</p>
        </LegalSection>
        <LegalSection number="11" title="Responsabilidad y legislación aplicable">
          <p>Ninguna disposición limita derechos irrenunciables del consumidor. Dentro de lo permitido por la ley, Zella AI no responde por decisiones tomadas exclusivamente sobre resultados no verificados, pérdidas indirectas o fallas atribuibles a terceros.</p>
          <p>Estos términos se interpretan conforme la legislación que resulte aplicable a la contratación, sin afectar la jurisdicción ni los derechos obligatorios que correspondan al consumidor en su país de residencia.</p>
        </LegalSection>
        <LegalSection number="12" title="Cambios y contacto">
          <p>Podemos actualizar estos términos para reflejar cambios del servicio o regulatorios. La versión vigente y su fecha estarán siempre publicadas aquí. Para consultas o reclamos, visitá <Link className="text-emerald-300 hover:text-emerald-200" href="/contacto">Contacto</Link>.</p>
        </LegalSection>
      </div>
    </LegalPageShell>
  );
}
