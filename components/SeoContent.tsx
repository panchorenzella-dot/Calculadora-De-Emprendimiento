export default function SeoContent() {
  return (
    <section className="mt-10 space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">
          ¿Qué es el margen de ganancia?
        </h2>
        <p className="mt-3 text-white/75">
          El margen de ganancia muestra cuánto dinero te queda después de cubrir
          los costos de vender un producto o servicio. Es una métrica clave para
          cualquier emprendimiento porque te ayuda a saber si el precio de venta
          realmente deja ganancia y si tu negocio es rentable.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">
          Cómo calcular el margen de ganancia
        </h2>
        <p className="mt-3 text-white/75">
          Para calcular el margen necesitás conocer el precio de venta, el costo
          variable por unidad, los costos fijos mensuales y la cantidad de
          unidades vendidas. Con esos datos podés estimar la ganancia mensual,
          el punto de equilibrio y cuánto tiempo tardás en recuperar la
          inversión inicial.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">
          Ejemplo práctico de rentabilidad
        </h2>
        <p className="mt-3 text-white/75">
          Si vendés un producto a $10.000 y el costo variable es de $6.000, tu
          margen bruto por unidad es de $4.000. Después, al restar costos fijos
          como alquiler, sueldos o servicios, obtenés la ganancia real del mes.
          Esta calculadora te ayuda a ver ese resultado de forma rápida y clara.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">
          Errores comunes al calcular costos y ganancias
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-white/75">
          <li>No incluir todos los costos fijos del negocio.</li>
          <li>Confundir facturación con ganancia real.</li>
          <li>No contemplar IVA u otros impuestos.</li>
          <li>Usar precios o costos desactualizados.</li>
          <li>No calcular el punto de equilibrio.</li>
        </ul>
      </div>
    </section>
  );
}