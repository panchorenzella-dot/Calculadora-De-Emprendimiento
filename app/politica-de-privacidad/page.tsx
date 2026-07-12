import Link from "next/link";

const sections = [
  ["1", "Qué información tratamos", "Si creás una cuenta, tratamos tu email y los datos que decidas completar en tu perfil. Si guardás un escenario, almacenamos su nombre, los valores ingresados y los resultados para que puedas consultarlos más adelante."],
  ["2", "Cómo usamos la información", "Usamos esos datos para autenticarte, mostrar tu perfil, conservar tus escenarios y prestar las funciones de la plataforma. No vendemos tu información personal."],
  ["3", "Cálculos y escenarios", "Podés usar las calculadoras sin guardar un escenario. Cuando elegís guardarlo en tu cuenta, sus datos quedan asociados a tu usuario y podés eliminarlos desde tu perfil."],
  ["4", "Proveedores de servicio", "Utilizamos proveedores tecnológicos para autenticación y almacenamiento. Estos proveedores procesan información únicamente para prestar sus servicios y bajo sus propias medidas de seguridad."],
  ["5", "Cookies y tecnologías similares", "Podemos usar almacenamiento local o cookies necesarias para mantener tu sesión y recordar preferencias. Si incorporamos herramientas de medición, actualizaremos esta política con la información correspondiente."],
  ["6", "Tus opciones", "Podés editar los datos de tu perfil, eliminar escenarios guardados y cerrar sesión en cualquier momento. Para solicitar acceso, corrección o eliminación de tu cuenta, escribinos por email."],
  ["7", "Seguridad y conservación", "Aplicamos medidas razonables para proteger la información. Conservamos los datos mientras tu cuenta esté activa o mientras sean necesarios para ofrecerte el servicio y cumplir obligaciones aplicables."],
  ["8", "Cambios en esta política", "Podemos actualizar esta política cuando cambien las funciones o prácticas de la plataforma. La versión vigente siempre estará publicada en esta página."],
];

export default function PoliticaPage() {
  return <main className="min-h-screen bg-zinc-950 text-white">
    <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.12),transparent_42%)]"><div className="mx-auto max-w-5xl px-6 py-16 sm:py-20"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/75">Transparencia y confianza</p><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Política de privacidad</h1><p className="mt-5 max-w-2xl leading-7 text-white/60">Te contamos de forma clara qué información usamos, por qué la necesitamos y qué opciones tenés sobre tus datos.</p><p className="mt-5 text-xs text-white/35">Última actualización: 12 de julio de 2026</p></div></section>
    <div className="mx-auto max-w-5xl px-6 py-14"><div className="grid gap-5">{sections.map(([number,title,text]) => <section key={number} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-[3rem_1fr]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/10 text-sm font-bold text-emerald-300">{number}</span><div><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-white/55">{text}</p></div></section>)}</div>
      <section className="mt-10 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-7"><p className="text-sm font-semibold text-emerald-300">¿Tenés una consulta sobre tus datos?</p><p className="mt-3 text-white/60">Escribinos a <a className="font-medium text-white hover:text-emerald-300" href="mailto:calculadoraemprendedora@gmail.com">calculadoraemprendedora@gmail.com</a>.</p><Link href="/contacto" className="mt-5 inline-block text-sm font-semibold text-emerald-300">Ir a contacto →</Link></section>
    </div>
  </main>;
}
