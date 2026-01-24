export default function InfoSections() {
  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold">Cómo lo calculamos</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
          <li>UnidadesMes = unidades por día × días abiertos</li>
          <li>VentasBrutas = unidadesMes × precio</li>
          <li>VentasNetas = IVA incluido ? VentasBrutas / 1.21 : VentasBrutas</li>
          <li>CostoUnit = precio × (costo % / 100) ó costo fijo</li>
          <li>MargenUnit = precio − costo unitario</li>
          <li>GananciaMes = margen bruto − costos fijos</li>
          <li>Break-even = costos fijos / margen unitario</li>
          <li>Recupero = inversión / ganancia mensual</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold">Limitaciones</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
          <li>No contempla estacionalidad ni variaciones de demanda.</li>
          <li>IVA fijo 21% solo como referencia.</li>
          <li>No incluye otros impuestos.</li>
          <li>Si la ganancia es ≤ 0, no hay recupero.</li>
        </ul>
      </div>
    </div>
  );
}
