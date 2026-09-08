"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalculatorForm,
  CalculatorHeader,
  ExplainCard,
  ExplainGrid,
  MoneyField,
  PercentField,
  ResultCards,
  ResultsPanel,
  SelectField,
  SeoSection,
  TextField,
  parseDecimalInput,
} from "@/components/CalculatorPrimitives";
import { calculateIibb } from "@/lib/argentinaCalculators";
import { fmtNum } from "@/lib/format";
import { parseDigitsToNumber, validateNumericFields } from "@/lib/numberInput";

const jurisdictions = [
  "Ciudad Autónoma de Buenos Aires", "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán",
];

export default function IngresosBrutosClient() {
  const [jurisdiction, setJurisdiction] = useState("Buenos Aires");
  const [activity, setActivity] = useState("");
  const [taxableRevenue, setTaxableRevenue] = useState("");
  const [rate, setRate] = useState("");
  const [minimumTax, setMinimumTax] = useState("");
  const [withholdings, setWithholdings] = useState("");
  const [perceptions, setPerceptions] = useState("");
  const [bankCollections, setBankCollections] = useState("");
  const [previousBalance, setPreviousBalance] = useState("");
  const [results, setResults] = useState<ReturnType<typeof calculateIibb> | null>(null);
  const [error, setError] = useState("");

  const draft = useMemo(() => calculateIibb({
    taxableRevenue: parseDigitsToNumber(taxableRevenue),
    rate: parseDecimalInput(rate),
    minimumTax: parseDigitsToNumber(minimumTax),
    withholdings: parseDigitsToNumber(withholdings),
    perceptions: parseDigitsToNumber(perceptions),
    bankCollections: parseDigitsToNumber(bankCollections),
    previousBalance: parseDigitsToNumber(previousBalance),
  }), [taxableRevenue, rate, minimumTax, withholdings, perceptions, bankCollections, previousBalance]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateNumericFields([
      { name: "revenue", label: "Facturación gravada del período", value: taxableRevenue, required: true, min: 0 },
      { name: "rate", label: "Alícuota aplicable", value: rate, required: true, min: 0, max: 100 },
      { name: "minimum", label: "Impuesto mínimo del período", value: minimumTax, min: 0 },
      { name: "withholdings", label: "Retenciones sufridas", value: withholdings, min: 0 },
      { name: "perceptions", label: "Percepciones sufridas", value: perceptions, min: 0 },
      { name: "bank", label: "Recaudaciones bancarias", value: bankCollections, min: 0 },
      { name: "balance", label: "Saldo a favor anterior", value: previousBalance, min: 0 },
    ]);
    if (!validation.valid || validation.values.revenue <= 0) {
      setError(validation.firstError || "La facturación gravada debe ser mayor que cero.");
      setResults(null);
      return;
    }
    setError("");
    setResults(draft);
  }

  return <main>
    <CalculatorHeader eyebrow="Impuestos provinciales · Argentina" title="Calculadora de Ingresos Brutos" description="Estimá el anticipo de Ingresos Brutos de una jurisdicción usando tu facturación gravada, alícuota y recaudaciones sufridas." />
    <div className="grid gap-6 lg:grid-cols-2">
      <CalculatorForm onSubmit={submit} error={error}>
        <SelectField label="Jurisdicción" value={jurisdiction} onChange={setJurisdiction} hint="La selección identifica el escenario; la alícuota se carga manualmente porque depende de la actividad y la normativa local.">
          {jurisdictions.map((item) => <option key={item} value={item}>{item}</option>)}
        </SelectField>
        <TextField label="Actividad o código de actividad" value={activity} onChange={setActivity} placeholder="Ej.: comercio minorista" hint="Opcional, sirve para identificar el cálculo guardado." />
        <MoneyField label="Facturación gravada del período" value={taxableRevenue} onChange={setTaxableRevenue} hint="Base atribuible a la jurisdicción seleccionada" />
        <PercentField label="Alícuota aplicable" value={rate} onChange={setRate} hint="Copiala de tu constancia, padrón o ley tarifaria. No existe una tasa única nacional." />
        <MoneyField label="Impuesto mínimo del período" value={minimumTax} onChange={setMinimumTax} hint="Opcional: dejalo en cero si no corresponde" />
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-semibold">Pagos a cuenta y saldos</p>
          <div className="mt-4 grid gap-4">
            <MoneyField label="Retenciones sufridas" value={withholdings} onChange={setWithholdings} />
            <MoneyField label="Percepciones sufridas" value={perceptions} onChange={setPerceptions} />
            <MoneyField label="Recaudaciones bancarias" value={bankCollections} onChange={setBankCollections} hint="Por ejemplo, SIRCREB u otro régimen aplicable" />
            <MoneyField label="Saldo a favor anterior" value={previousBalance} onChange={setPreviousBalance} />
          </div>
        </div>
      </CalculatorForm>
      <ResultsPanel hasResults={Boolean(results)} status={results ? <div className={`mt-5 rounded-2xl border p-4 ${results.taxToPay > 0 ? "border-amber-300/20 bg-amber-300/[0.05]" : "border-emerald-300/20 bg-emerald-300/[0.05]"}`}><p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">{jurisdiction}</p><p className="mt-2 text-lg font-semibold">{results.taxToPay > 0 ? "Anticipo estimado a pagar" : "Sin saldo a pagar estimado"}</p></div> : null}>
        {results ? <ResultCards items={[
          { title: "Impuesto por alícuota", value: results.calculatedTax },
          { title: "Impuesto determinado", value: results.determinedTax, note: parseDigitsToNumber(minimumTax) > results.calculatedTax ? "Se aplicó el mínimo ingresado." : undefined },
          { title: "Pagos a cuenta y saldos", value: results.credits },
          { title: "Ingresos Brutos a pagar", value: results.taxToPay },
          { title: "Saldo a favor estimado", value: results.balanceInFavor },
          { title: "Tasa efectiva", value: `${fmtNum(results.effectiveRate, 3)}%`, money: false },
        ]} /> : null}
      </ResultsPanel>
    </div>
    <ExplainGrid>
      <ExplainCard title="Cómo se calcula">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Aplicamos la alícuota a la facturación gravada atribuible a la jurisdicción.</li>
          <li>Si ingresaste un mínimo y supera ese cálculo, usamos el mínimo.</li>
          <li>Restamos retenciones, percepciones, recaudaciones bancarias y saldo a favor anterior.</li>
        </ol>
      </ExplainCard>
      <ExplainCard title="Alcance de la estimación" warning>
        <p>Esta primera versión está pensada para una jurisdicción. No distribuye base imponible mediante coeficientes de Convenio Multilateral ni valida exenciones, tratamientos especiales o topes.</p>
      </ExplainCard>
    </ExplainGrid>
    <div className="mt-10 space-y-6">
      <SeoSection title="¿Qué es el impuesto sobre los Ingresos Brutos?">
        <p>Es un tributo provincial que normalmente aplica un porcentaje sobre los ingresos de una actividad, independientemente de la ganancia obtenida. La normativa cambia según cada jurisdicción.</p>
      </SeoSection>
      <SeoSection title="¿Cómo saber qué alícuota de IIBB corresponde?">
        <p>La alícuota depende de la provincia, el código de actividad, los ingresos del contribuyente y posibles beneficios o incrementos. Consultá el padrón o la ley tarifaria de tu jurisdicción antes de usar el resultado.</p>
      </SeoSection>
      <SeoSection title="Retenciones, percepciones y recaudaciones bancarias">
        <p>Estos importes suelen funcionar como pagos a cuenta. Si superan el impuesto determinado pueden producir un saldo a favor. Encontrá el acceso a los organismos provinciales en el <a className="font-semibold text-emerald-200 hover:text-emerald-100" href="https://www.argentina.gob.ar/ingresosbrutos" target="_blank" rel="noreferrer">portal oficial de Ingresos Brutos</a>.</p>
      </SeoSection>
    </div>
  </main>;
}
