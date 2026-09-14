import Link from "next/link";

const questions = [
  {
    question: "¿Es gratis de verdad?",
    structuredAnswer: "Sí. Las calculadoras gratuitas se pueden usar sin límite y sin tarjeta. La cuenta gratis permite guardar hasta 2 escenarios y probar la IA; los planes pagos amplían las herramientas de IA, el historial y la comparación.",
    answer: <>Sí. Podés usar las calculadoras gratuitas sin límite y sin cargar una tarjeta. Con una cuenta gratis también podés guardar hasta 2 escenarios y probar la IA con un cupo reducido. Los planes pagos amplían las calculadoras incluidas en el plan, la IA, el historial y la comparación.</>,
  },
  {
    question: "¿Sirve para mi tipo de negocio?",
    structuredAnswer: "Sí. Está pensada para comercios, servicios, producción, gastronomía, reventa e intermediación, con calculadoras generales y herramientas específicas por rubro.",
    answer: <>Está pensada para comercios, servicios, producción, gastronomía, reventa e intermediación. Además de las calculadoras generales, la sección <Link href="/calculadoras#mi-rubro" className="font-semibold text-emerald-200 hover:text-emerald-100">Mi rubro</Link> reúne herramientas con costos y métricas propias de cada actividad.</>,
  },
  {
    question: "¿Necesito saber de finanzas para usarla?",
    structuredAnswer: "No. Cada calculadora explica qué dato cargar y cómo se obtiene el resultado, y las guías gratuitas desarrollan fórmulas, ejemplos y errores frecuentes.",
    answer: <>No. Cada calculadora está escrita en lenguaje simple, explica qué dato cargar y muestra cómo se obtiene el resultado. Las <Link href="/guias" className="font-semibold text-emerald-200 hover:text-emerald-100">guías gratuitas</Link> desarrollan fórmulas, ejemplos y errores frecuentes.</>,
  },
  {
    question: "¿Cómo se procesan los pagos?",
    structuredAnswer: "La suscripción se confirma en PayPal, fuera de Calculadora Emprendedora. La plataforma no recibe ni guarda datos de tarjeta. PayPal muestra el importe en USD antes de confirmar.",
    answer: <>La suscripción se confirma en PayPal, fuera de Calculadora Emprendedora. Nosotros no recibimos ni guardamos los datos de tu tarjeta. PayPal muestra el importe en USD y cualquier conversión aplicable antes de que confirmes.</>,
  },
  {
    question: "¿Puedo cancelar cuando quiera?",
    structuredAnswer: "Sí. Los planes se renuevan mensualmente y la renovación puede cancelarse desde PayPal. El acceso continúa hasta el final del período pagado y los datos no se eliminan.",
    answer: <>Sí. Todos los planes son mensuales y se renuevan mes a mes. Podés cancelar la renovación desde PayPal; tu acceso se mantiene hasta el final del período ya pagado y tus datos no se eliminan.</>,
  },
  {
    question: "¿Cómo funciona la comparación de escenarios?",
    structuredAnswer: "Se guardan alternativas de una misma calculadora para comparar sus datos y resultados lado a lado. Pro permite hasta 3 escenarios simultáneos y Premium no impone un límite simultáneo.",
    answer: <>Guardás distintas alternativas de una misma calculadora y comparás lado a lado sus datos y resultados. Pro permite comparar hasta 3 al mismo tiempo; Premium no impone un límite simultáneo.</>,
  },
  {
    question: "¿Qué pasa si llego al límite de mi plan?",
    structuredAnswer: "Los escenarios y conversaciones permanecen guardados. Solo se bloquea temporalmente la acción que agotó su cupo hasta la renovación o el cambio de plan.",
    answer: <>Tus escenarios y conversaciones siguen guardados. Solo se bloquea temporalmente la acción que agotó su cupo. Los consumos de IA se renuevan según el período indicado en tu perfil; también podés cambiar de plan.</>,
  },
  {
    question: "¿La IA reemplaza a un contador o asesor?",
    structuredAnswer: "No. La IA ayuda a interpretar números, supuestos y preguntas, pero no sustituye una revisión contable, impositiva, legal o financiera profesional.",
    answer: <>No. La IA ayuda a interpretar los números, detectar supuestos y preparar preguntas, pero no reemplaza una revisión contable, impositiva, legal o financiera profesional cuando la decisión lo requiere.</>,
  },
  {
    question: "¿Mis cálculos quedan privados?",
    structuredAnswer: "Sí. Los escenarios guardados se asocian a la cuenta, no son públicos y pueden eliminarse desde el perfil. El contexto solo se envía a la IA cuando el usuario solicita un análisis.",
    answer: <>Sí. Los escenarios guardados se asocian a tu cuenta y no son públicos. Podés eliminarlos desde tu perfil. Solo se envía a la IA el contexto necesario cuando vos pedís expresamente un análisis.</>,
  },
  {
    question: "¿Puedo cambiar de plan más adelante?",
    structuredAnswer: "Sí. Los cálculos se conservan al cambiar de nivel. Si existe una suscripción activa, primero se administra o cancela en PayPal y luego se elige el nuevo plan.",
    answer: <>Sí. Tus cálculos no dependen de un plan específico y se conservan cuando cambiás de nivel. Si ya tenés una suscripción activa, primero administrás o cancelás la actual desde PayPal y luego elegís la nueva.</>,
  },
];

export const pricingFaqSchemaEntries = questions.map(({ question, structuredAnswer }) => ({
  "@type": "Question",
  name: question,
  acceptedAnswer: {
    "@type": "Answer",
    text: structuredAnswer,
  },
}));

export default function PricingFaq() {
  return (
    <section aria-labelledby="pricing-faq-title" className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/60">Preguntas frecuentes</p>
          <h2 id="pricing-faq-title" className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Todo claro antes de elegir</h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/45">Planes mensuales, límites transparentes y pagos procesados de forma segura fuera de la plataforma.</p>
        </div>

        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {questions.map((item, index) => (
            <details key={item.question} className="group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 font-semibold text-white/85 outline-none transition hover:text-white focus-visible:text-emerald-100 [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full border border-white/10 text-lg font-light text-white/45 transition group-open:rotate-45 group-open:border-emerald-200/20 group-open:text-emerald-200">+</span>
              </summary>
              <div className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-white/48">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
