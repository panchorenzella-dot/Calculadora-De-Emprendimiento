export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">

        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Contacto
        </h1>

        <p className="text-zinc-400 mb-6">
          Si tenés preguntas, sugerencias o encontraste algún error en las
          calculadoras, podés contactarnos por email.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <p className="text-sm text-zinc-400 mb-2">Email de contacto</p>

          <p className="text-lg font-medium">
            calculadoraemprendedora@gmail.com
          </p>

          <p className="text-sm text-zinc-500 mt-3">
            (Podes Ayudarnos con cualquier inconveniente)
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-3">
          Sobre la plataforma
        </h2>

        <p className="text-zinc-400 mb-4">
          Calculadora Emprendedora es una herramienta diseñada para ayudar a
          emprendedores, comerciantes y profesionales a entender mejor la
          rentabilidad de sus negocios mediante cálculos simples como margen,
          punto de equilibrio, ROI e interés compuesto.
        </p>

        <p className="text-zinc-400">
          Nuestro objetivo es ofrecer herramientas gratuitas, rápidas y fáciles
          de usar para mejorar la toma de decisiones financieras.
        </p>

      </div>
    </main>
  );
}