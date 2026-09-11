"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalculatorForm,
  CalculatorHeader,
  ExplainCard,
  ExplainGrid,
  MoneyField,
  ResultCards,
  ResultsPanel,
  SeoSection,
} from "@/components/CalculatorPrimitives";
import { calculateIvaMonthly, IVA_RATES } from "@/lib/argentinaCalculators";
import { parseDigitsToNumber, validateNumericFields } from "@/lib/numberInput";

type Amounts = Record<string, string>;
const emptyRates = () => Object.fromEntries(IVA_RATES.map((rate) => [String(rate), ""]));

export default function IvaMensualClient() {
  const [sales, setSales] = useState<Amounts>(emptyRates);
  const [purchases, setPurchases] = useState<Amounts>(emptyRates);
  const [previousTechnicalBalance, setPreviousTechnicalBalance] = useState("");
  const [withholdings, setWithholdings] = useState("");
  const [perceptions, setPerceptions] = useState("");
  const [paymentsOnAccount, setPaymentsOnAccount] = useState("");
  const [previousFreeBalance, setPreviousFreeBalance] = useState("");
  const [results, setResults] = useState<ReturnType<typeof calculateIvaMonthly> | null>(null);
  const [error, setError] = useState("");

  const draft = useMemo(() => calculateIvaMonthly({
    sales: Object.fromEntries(Object.entries(sales).map(([rate, amount]) => [rate, parseDigitsToNumber(amount)])),
    purchases: Object.fromEntries(Object.entries(purchases).map(([rate, amount]) => [rate, parseDigitsToNumber(amount)])),
    previousTechnicalBalance: parseDigitsToNumber(previousTechnicalBalance),
    withholdings: parseDigitsToNumber(withholdings),
    perceptions: parseDigitsToNumber(perceptions),
    paymentsOnAccount: parseDigitsToNumber(paymentsOnAccount),
    previousFreeBalance: parseDigitsToNumber(previousFreeBalance),
  }), [sales, purchases, previousTechnicalBalance, withholdings, perceptions, paymentsOnAccount, previousFreeBalance]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateNumericFields([
      ...IVA_RATES.flatMap((rate) => {
        const displayRate = String(rate).replace(".", ",");
        return [
          { name: `sales-${rate}`, label: `Ventas netas al ${displayRate}%`, value: sales[String(rate)], min: 0 },
          { name: `purchases-${rate}`, label: `Compras netas al ${displayRate}%`, value: purchases[String(rate)], min: 0 },
        ];
      }),
      { name: "technical", label: "Saldo técnico anterior", value: previousTechnicalBalance, min: 0 },
      { name: "withholdings", label: "Retenciones de IVA", value: withholdings, min: 0 },
      { name: "perceptions", label: "Percepciones de IVA", value: perceptions, min: 0 },
      { name: "payments", label: "Pagos a cuenta", value: paymentsOnAccount, min: 0 },
      { name: "free", label: "Saldo de libre disponibilidad anterior", value: previousFreeBalance, min: 0 },
    ]);
    if (!validation.valid) {
      setError(validation.firstError || "Revisá los importes ingresados.");
      setResults(null);
      return;
    }
    setError("");
    setResults(draft);
  }

  return <main>
    <CalculatorHeader eyebrow="Impuestos · Argentina" title="Calculadora de IVA mensual" description="Estimá el IVA a pagar del mes a partir del débito fiscal de tus ventas, el crédito fiscal computable de tus compras y los saldos a favor." />

    <div className="grid items-start gap-6 lg:grid-cols-[1.12fr_0.88fr]">
      <CalculatorForm onSubmit={submit} error={error}>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-semibold text-white">Montos netos gravados por alícuota</p>
          <p className="mt-1 text-xs leading-5 text-white/45">Ingresá importes sin IVA. Si no usaste una alícuota, dejala en cero.</p>
          <div className="mt-4 grid gap-4">
            {IVA_RATES.map((rate) => <div key={rate} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200/60">Alícuota {String(rate).replace(".", ",")}%</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <MoneyField label={`Ventas netas al ${String(rate).replace(".", ",")}%`} value={sales[String(rate)]} onChange={(value) => setSales((current) => ({ ...current, [String(rate)]: value }))} />
                <MoneyField label={`Compras netas al ${String(rate).replace(".", ",")}%`} value={purchases[String(rate)]} onChange={(value) => setPurchases((current) => ({ ...current, [String(rate)]: value }))} />
              </div>
            </div>)}
          </div>
        </div>

        <MoneyField label="Saldo técnico a favor del período anterior" value={previousTechnicalBalance} onChange={setPreviousTechnicalBalance} hint="El que surge de débito menos crédito fiscal" />
        <MoneyField label="Retenciones de IVA sufridas" value={withholdings} onChange={setWithholdings} />
        <MoneyField label="Percepciones de IVA sufridas" value={perceptions} onChange={setPerceptions} />
        <MoneyField label="Pagos a cuenta del período" value={paymentsOnAccount} onChange={setPaymentsOnAccount} />
        <MoneyField label="Saldo de libre disponibilidad anterior" value={previousFreeBalance} onChange={setPreviousFreeBalance} />
      </CalculatorForm>

      <ResultsPanel hasResults={Boolean(results)} status={results ? <div className={`mt-5 rounded-2xl border p-4 ${results.taxToPay > 0 ? "border-amber-300/20 bg-amber-300/[0.05]" : "border-emerald-300/20 bg-emerald-300/[0.05]"}`}><p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">Situación estimada</p><p className="mt-2 text-lg font-semibold">{results.taxToPay > 0 ? "Resultado a pagar" : "Sin saldo a pagar estimado"}</p></div> : null}>
        {results ? <ResultCards items={[
          { title: "Débito fiscal por ventas", value: results.taxDebit },
          { title: "Crédito fiscal por compras", value: results.taxCredit },
          { title: "Impuesto determinado", value: results.determinedTax },
          { title: "Créditos de libre disponibilidad", value: results.freeCredits },
          { title: "IVA estimado a pagar", value: results.taxToPay },
          { title: "Nuevo saldo técnico a favor", value: results.newTechnicalBalance },
          { title: "Nuevo saldo de libre disponibilidad", value: results.newFreeBalance },
        ]} /> : null}
      </ResultsPanel>
    </div>

    <ExplainGrid>
      <ExplainCard title="Cómo se calcula">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Calculamos el débito fiscal aplicando cada alícuota a las ventas netas.</li>
          <li>Calculamos el crédito fiscal de las compras computables.</li>
          <li>Al débito le restamos el crédito y el saldo técnico anterior.</li>
          <li>Al impuesto determinado le restamos retenciones, percepciones, pagos a cuenta y saldo de libre disponibilidad.</li>
        </ol>
      </ExplainCard>
      <ExplainCard title="Alcance de la estimación" warning>
        <p>La herramienta no reemplaza la declaración jurada. Notas de crédito, prorrateos, compras no computables, regímenes especiales, restituciones y otros ajustes pueden modificar el resultado.</p>
      </ExplainCard>
    </ExplainGrid>

    <div className="mt-10 space-y-6">
      <SeoSection title="¿Qué es el IVA mensual a pagar?">
        <p>Para un responsable inscripto, el cálculo mensual suele partir del IVA generado por las ventas y del IVA computable de compras y gastos. La diferencia puede generar impuesto determinado o un saldo técnico a favor.</p>
      </SeoSection>
      <SeoSection title="Diferencia entre saldo técnico y saldo de libre disponibilidad">
        <p>El saldo técnico proviene principalmente de comparar débitos y créditos fiscales. Las retenciones, percepciones y ciertos pagos a cuenta pueden generar saldo de libre disponibilidad. Su utilización y compensación dependen de las normas aplicables.</p>
      </SeoSection>
      <SeoSection title="Alícuotas de IVA contempladas">
        <p>La calculadora admite 2,5%, 5%, 10,5%, 21% y 27%. La alícuota correcta depende del bien, servicio y operación. Podés consultar la información y tus declaraciones en <a className="font-semibold text-emerald-200 hover:text-emerald-100" href="https://www.arca.gob.ar/iva/" target="_blank" rel="noreferrer">ARCA</a>.</p>
      </SeoSection>
    </div>
  </main>;
}
