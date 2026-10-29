import ResultInsight, { type ChartDatum } from "./ResultInsight";

type Metrics = Record<string, unknown>;
const business = ["reventa", "produccion", "cafeteria", "hamburgueseria", "distribuidora", "intermediarios"];
export default function CalculatorInterpretation({ kind, result: r, currency = "ARS", evolution }: { kind: string; result: Metrics; currency?: "ARS" | "USD"; evolution?: ChartDatum[] }) {
  const n = (key: string) => typeof r[key] === "number" ? r[key] as number : 0;
  const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
  const datum = (label: string, value: number, outcome = false): ChartDatum => ({ label, value, tone: outcome ? value < 0 ? "negative" : value > 0 ? "positive" : "neutral" : "neutral" });
  const profitText = (value: number, period: string) => value > 0 ? `La ganancia estimada ${period} es ${money(value)}.` : value < 0 ? `La pérdida estimada ${period} es ${money(value)}: los ingresos no cubren los costos cargados.` : `El resultado ${period} es cero: no hay ganancia ni pérdida con estos datos.`;
  let title = "Qué significa tu resultado";
  let explanation = "";
  let scope = "Incluye únicamente los datos cargados. Impuestos, comisiones, devoluciones, inflación y otros gastos no ingresados pueden cambiar el resultado. La ganancia estimada no equivale al dinero disponible en caja: también influyen cobros, pagos y stock.";
  let data: ChartDatum[] = [];
  let unit: "money" | "units" | "percent" = "money";
  if (business.includes(kind)) {
    const revenue = n(kind === "intermediarios" ? "ingresoBrutoMensual" : "ventasMensuales");
    const profit = n("gananciaNetaMensual");
    explanation = `${profitText(profit, "por mes")} La facturación de ${money(revenue)} representa ingresos antes de restar costos; el resultado descuenta los gastos variables y fijos cargados. ${kind === "intermediarios" ? "El ingreso corresponde a tus comisiones, no al valor total de las operaciones." : "La proyección supone que se vende la cantidad indicada."}`;
    data = [datum("Ingresos mensuales", revenue), datum("Costos mensuales cargados", revenue - profit), datum(profit < 0 ? "Pérdida mensual" : "Ganancia mensual", profit, true)];
  } else if (kind === "margen") {
    explanation = `${profitText(n("gananciaMes"), "mensual")} Se restan costos variables y fijos de las ventas netas. El margen unitario contribuye a cubrir los gastos fijos; por sí solo no es ganancia mensual.`;
    data = [datum("Ventas netas", n("ventasNetas")), datum("Costos incluidos", n("ventasNetas") - n("gananciaMes")), datum("Resultado mensual", n("gananciaMes"), true)];
  } else if (kind === "markup") {
    explanation = `${profitText(n("gananciaPorUnidad"), "por unidad")} El margen se mide sobre el precio de venta y el markup sobre el costo: sus porcentajes son distintos. El precio calculado es una estimación basada en los costos y objetivos ingresados.`;
    data = [datum("Precio de venta", n("precioCalculado")), datum("Costo total unitario", n("costoTotalUnitario")), datum("Cargos por venta", n("cargosPorVenta")), datum("Resultado por unidad", n("gananciaPorUnidad"), true)];
  } else if (kind === "punto-de-equilibrio") {
    unit = "units";
    explanation = n("margenContribucionUnit") <= 0 ? "Con este precio no existe un punto de equilibrio alcanzable: cada venta deja una contribución nula o negativa antes de cubrir los gastos fijos." : `Necesitás ${Math.ceil(n("unidadesEquilibrio")).toLocaleString("es-AR")} ventas para cubrir los costos cargados. En el equilibrio no obtenés ganancia. ${profitText(n("gananciaEstimada"), "con las ventas estimadas (si las cargaste)")}`;
    data = [datum("Ventas estimadas", n("ventas")), ...(Number.isFinite(n("unidadesEquilibrio")) ? [datum("Ventas para cubrir costos", Math.ceil(n("unidadesEquilibrio")))] : [])];
  } else if (kind === "interes-compuesto" || kind === "aporte-mensual") {
    title = "Cómo evoluciona tu capital";
    const contributed = n(kind === "interes-compuesto" ? "totalAportado" : "totalInvertido");
    const interest = n(kind === "interes-compuesto" ? "interesGanado" : "gananciaGenerada");
    explanation = `Aportarías ${money(contributed)} y el rendimiento estimado agregaría ${money(interest)}. Las barras muestran el capital acumulado al cierre de cada período: gris para tus aportes y verde para el rendimiento.`;
    data = evolution ?? [];
    scope = "Proyección nominal con la tasa y frecuencia ingresadas, aportes al final de cada mes y, cuando corresponde, aumento anual del aporte. No descuenta inflación, impuestos ni comisiones. La tasa supuesta no garantiza rendimientos futuros; se simulan hasta 1.200 meses.";
  } else if (kind === "meta-ahorro") {
    explanation = r.ahorroMensualNecesario === null ? "Con el plazo ingresado no puede calcularse un aporte mensual. Revisá el horizonte antes de interpretar la proyección." : `Para la meta de ${money(n("metaAhorro"))}, el aporte mensual inicial estimado es ${money(n("ahorroMensualNecesario"))}. Se consideran el ahorro inicial, el plazo, la tasa y el incremento anual de aportes ingresados.`;
    data = [datum("Meta", n("metaAhorro")), datum("Ahorro inicial", n("ahorroInicial")), datum("Total aportado proyectado", n("totalAportado")), datum("Capital final estimado", n("valorFinalEstimado"))];
    scope = "Proyección nominal, con aportes al final del mes; no incluye inflación, impuestos ni comisiones. Los rendimientos futuros no están garantizados.";
  } else if (kind === "recupero-capital") {
    explanation = r.mesesParaRecuperar === null ? "No se puede estimar el recupero sin una ganancia mensual positiva. Revisá también que exista inversión inicial." : `Recuperarías la inversión en aproximadamente ${n("mesesParaRecuperar").toLocaleString("es-AR", { maximumFractionDigits: 1 })} meses si se mantiene el resultado mensual. El gráfico diferencia el capital recuperado del pendiente dentro del plazo analizado.`;
    data = [datum("Capital recuperado", n("capitalRecuperado")), datum("Capital pendiente", n("capitalPendiente"))];
    scope = "Recupero simple con resultado mensual constante. No descuenta el valor del dinero en el tiempo ni contempla cambios de ventas, inflación o calendario de cobros y pagos. Capital recuperado no es ganancia adicional.";
  } else if (kind === "roi" || kind === "roi-inversion") {
    explanation = `${profitText(n("gananciaNeta"), "del período")} El ROI compara ese resultado con el capital invertido, incluyendo los costos según el modelo de esta herramienta. El porcentaje corresponde al período analizado; no es automáticamente un retorno anual.`;
    data = kind === "roi" ? [datum("Inversión inicial", n("investment")), datum("Retorno bruto", n("retornoBruto")), datum("Resultado neto", n("gananciaNeta"), true)] : [datum("Total invertido con costos", n("totalInvertidoReal")), datum("Valor final", n("totalInvertidoReal") + n("gananciaNeta")), datum("Resultado neto", n("gananciaNeta"), true)];
    scope = "Se descuentan únicamente los costos ingresados. No se ajusta por inflación ni se predicen retornos futuros. El ROI no representa caja disponible.";
  } else if (kind === "rendimiento-real") {
    unit = "percent";
    explanation = `El rendimiento nominal es ${n("rendimientoNominal").toFixed(2)}% y, ajustado por la inflación ingresada, es ${n("rendimientoReal").toFixed(2)}%. ${n("rendimientoReal") < 0 ? "El capital perdió poder de compra aunque su importe nominal pueda haber aumentado." : "El ajuste permite comparar el poder de compra inicial y final."}`;
    data = [datum("Rendimiento nominal", n("rendimientoNominal"), true), datum("Inflación del período", n("inflacionCargada")), datum("Rendimiento real", n("rendimientoReal"), true)];
    scope = "Se usa la inflación del mismo período y los costos cargados. El ajuste es multiplicativo, no una resta simple de porcentajes. No estima rendimientos futuros.";
  } else if (kind === "iva-producto") {
    explanation = `El precio neto unitario es ${money(n("netUnit"))}, el IVA es ${money(n("ivaUnit"))} y el total es ${money(n("totalUnit"))}. Para extraer IVA incluido se divide por uno más la alícuota; no se resta el porcentaje al total.`;
    data = [datum("Precio neto unitario", n("netUnit")), datum("IVA unitario", n("ivaUnit")), datum("Precio final unitario", n("totalUnit"))];
    scope = "Desglose con la alícuota y cantidad ingresadas. El IVA no es ganancia. No determina tu condición fiscal ni incluye otros tributos o percepciones.";
  } else if (kind === "iva-mensual") {
    explanation = `El IVA estimado a pagar es ${money(n("taxToPay"))}. Se comparan débito de ventas y crédito de compras, luego se aplican los saldos y pagos cargados. El saldo técnico y el de libre disponibilidad tienen tratamientos distintos.`;
    data = [datum("Débito fiscal", n("taxDebit")), datum("Crédito fiscal", n("taxCredit")), datum("Pagos y créditos libres", n("freeCredits")), datum("IVA a pagar", n("taxToPay"))];
    scope = "Estimación con bases netas y créditos computables ingresados. Un saldo a favor no equivale a efectivo disponible. No reemplaza la liquidación ni valida el tratamiento fiscal de cada operación.";
  } else if (kind === "ingresos-brutos") {
    explanation = `El anticipo estimado a pagar es ${money(n("taxToPay"))} y el saldo a favor es ${money(n("balanceInFavor"))}. Se aplica la alícuota y el mínimo ingresados, y se descuentan retenciones, percepciones y saldos cargados.`;
    data = [datum("Impuesto determinado", n("determinedTax")), datum("Créditos y anticipos", n("credits")), datum("Saldo a pagar", n("taxToPay"))];
    scope = "Estimación para régimen local con datos ingresados. No verifica alícuotas vigentes, exenciones ni Convenio Multilateral. El saldo a favor no es ganancia ni caja disponible.";
  } else if (kind === "costo-laboral") {
    explanation = `El costo mensual de caja estimado es ${money(n("monthlyCashCost"))}. Al sumar provisiones de aguinaldo, sus cargas y plus vacacional, el costo mensualizado asciende a ${money(n("annualizedMonthlyCost"))}. Las provisiones no son necesariamente pagos de ese mes.`;
    data = [datum("Costo mensual de caja", n("monthlyCashCost")), datum("Provisiones mensualizadas", n("annualizedMonthlyCost") - n("monthlyCashCost")), datum("Costo mensual completo", n("annualizedMonthlyCost"))];
    scope = "Incluye sueldo bruto y cargas, seguros y adicionales cargados, más las provisiones indicadas. No calcula sueldo neto, indemnizaciones ni valida convenios o beneficios particulares. Revisá las tasas aplicables.";
  }
  if (!explanation) return null;
  return <ResultInsight title={title} explanation={explanation} scope={scope} data={data} currency={currency} unit={unit}>{evolution ? "Evolución del capital · aportes en gris y rendimiento en verde" : undefined}</ResultInsight>;
}
