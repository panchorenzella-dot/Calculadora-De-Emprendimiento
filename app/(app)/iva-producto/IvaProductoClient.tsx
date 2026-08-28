"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalculatorForm,
  CalculatorHeader,
  ExplainCard,
  ExplainGrid,
  IntegerField,
  MoneyField,
  PercentField,
  ResultCards,
  ResultsPanel,
  SegmentedControl,
  SelectField,
  SeoSection,
  parseDecimalInput,
} from "@/components/CalculatorPrimitives";
import { calculateProductIva } from "@/lib/argentinaCalculators";
import { parseDigitsToNumber } from "@/lib/numberInput";

export default function IvaProductoClient() {
  const [mode, setMode] = useState<"add" | "extract">("add");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [rateChoice, setRateChoice] = useState("21");
  const [customRate, setCustomRate] = useState("");
  const [results, setResults] = useState<ReturnType<typeof calculateProductIva> | null>(null);
  const rate = rateChoice === "custom" ? parseDecimalInput(customRate) : Number(rateChoice);

  const draft = useMemo(() => calculateProductIva({
    amount: parseDigitsToNumber(amount),
    quantity: parseDigitsToNumber(quantity),
    rate,
    mode,
  }), [amount, quantity, rate, mode]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResults(draft);
  }

  return <main>
    <CalculatorHeader eyebrow="Impuestos · Ventas" title="Calculadora de IVA por producto o servicio" description="Agregá IVA a un precio neto o separá el impuesto incluido en un precio final. También podés calcular varias unidades." />
    <div className="grid gap-6 lg:grid-cols-2">
      <CalculatorForm onSubmit={submit}>
        <SegmentedControl label="¿Qué querés hacer?" value={mode} onChange={(value) => setMode(value as "add" | "extract")} options={[{ value: "add", label: "Agregar IVA" }, { value: "extract", label: "Separar IVA incluido" }]} />
        <MoneyField label={mode === "add" ? "Precio neto sin IVA" : "Precio final con IVA"} value={amount} onChange={setAmount} />
        <SelectField label="Alícuota de IVA" value={rateChoice} onChange={setRateChoice}>
          <option value="2.5">2,5%</option><option value="5">5%</option><option value="10.5">10,5%</option><option value="21">21%</option><option value="27">27%</option><option value="custom">Otra alícuota</option>
        </SelectField>
        {rateChoice === "custom" ? <PercentField label="Alícuota personalizada" value={customRate} onChange={setCustomRate} /> : null}
        <IntegerField label="Cantidad de unidades" value={quantity} onChange={setQuantity} hint="Usá 1 para calcular un solo producto o servicio." />
      </CalculatorForm>
      <ResultsPanel hasResults={Boolean(results)}>
        {results ? <ResultCards items={[
          { title: "Precio neto unitario", value: results.netUnit },
          { title: "IVA por unidad", value: results.ivaUnit },
          { title: "Precio final unitario", value: results.totalUnit },
          { title: "Neto total", value: results.netTotal },
          { title: "IVA total", value: results.ivaTotal },
          { title: "Total final", value: results.grandTotal },
        ]} /> : null}
      </ResultsPanel>
    </div>
    <ExplainGrid>
      <ExplainCard title="Cómo se calcula">
        {mode === "add" ? <p>IVA = precio neto × alícuota. Precio final = precio neto + IVA.</p> : <p>Precio neto = precio final ÷ (1 + alícuota). IVA incluido = precio final − precio neto.</p>}
      </ExplainCard>
      <ExplainCard title="Alcance de la estimación" warning>
        <p>Elegí la alícuota aplicable a tu operación. No todos los productos y servicios tributan al 21%, y también existen operaciones exentas o no alcanzadas.</p>
      </ExplainCard>
    </ExplainGrid>
    <div className="mt-10 space-y-6">
      <SeoSection title="¿Cómo agregar IVA a un precio?">
        <p>Primero identificá el precio neto y la alícuota correspondiente. Por ejemplo, con una tasa del 21%, un precio neto de $100.000 genera $21.000 de IVA y un precio final de $121.000.</p>
      </SeoSection>
      <SeoSection title="¿Cómo sacar el IVA incluido de un precio final?">
        <p>No se obtiene restando directamente el porcentaje. Si el IVA es 21%, el precio final se divide por 1,21 para conocer el neto; la diferencia es el impuesto incluido.</p>
      </SeoSection>
      <SeoSection title="IVA por producto y precio de venta">
        <p>Separar correctamente el precio neto del IVA ayuda a preparar presupuestos, revisar facturas y calcular márgenes sin confundir impuesto cobrado con ingreso propio.</p>
      </SeoSection>
    </div>
  </main>;
}
