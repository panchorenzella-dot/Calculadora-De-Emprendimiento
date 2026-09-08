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
  SelectField,
  SeoSection,
  parseDecimalInput,
} from "@/components/CalculatorPrimitives";
import { calculateLaborCost } from "@/lib/argentinaCalculators";
import { fmtNum } from "@/lib/format";
import { parseDigitsToNumber, validateNumericFields } from "@/lib/numberInput";

type EmployerType = "general" | "large-services" | "custom";

export default function CostoLaboralClient() {
  const [employerType, setEmployerType] = useState<EmployerType>("general");
  const [grossSalary, setGrossSalary] = useState("");
  const [customSocialRate, setCustomSocialRate] = useState("");
  const [healthInsuranceRate, setHealthInsuranceRate] = useState("6");
  const [artRate, setArtRate] = useState("3");
  const [artFixed, setArtFixed] = useState("");
  const [collectiveAgreementRate, setCollectiveAgreementRate] = useState("");
  const [lifeInsurance, setLifeInsurance] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [vacationDays, setVacationDays] = useState("14");
  const [results, setResults] = useState<ReturnType<typeof calculateLaborCost> | null>(null);
  const [error, setError] = useState("");
  const socialSecurityRate = employerType === "general" ? 18 : employerType === "large-services" ? 20.4 : parseDecimalInput(customSocialRate);

  const draft = useMemo(() => calculateLaborCost({
    grossSalary: parseDigitsToNumber(grossSalary),
    socialSecurityRate,
    healthInsuranceRate: parseDecimalInput(healthInsuranceRate),
    artRate: parseDecimalInput(artRate),
    artFixed: parseDigitsToNumber(artFixed),
    collectiveAgreementRate: parseDecimalInput(collectiveAgreementRate),
    lifeInsurance: parseDigitsToNumber(lifeInsurance),
    otherCosts: parseDigitsToNumber(otherCosts),
    vacationDays: parseDigitsToNumber(vacationDays),
  }), [grossSalary, socialSecurityRate, healthInsuranceRate, artRate, artFixed, collectiveAgreementRate, lifeInsurance, otherCosts, vacationDays]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateNumericFields([
      { name: "salary", label: "Sueldo bruto mensual", value: grossSalary, required: true, min: 0 },
      ...(employerType === "custom" ? [{ name: "social", label: "Contribuciones de seguridad social", value: customSocialRate, required: true, min: 0, max: 100 }] : []),
      { name: "health", label: "Contribución a obra social", value: healthInsuranceRate, required: true, min: 0, max: 100 },
      { name: "art", label: "ART variable estimada", value: artRate, required: true, min: 0, max: 100 },
      { name: "artFixed", label: "Componente fijo de ART", value: artFixed, min: 0 },
      { name: "agreement", label: "Contribución adicional de convenio", value: collectiveAgreementRate, min: 0, max: 100 },
      { name: "insurance", label: "Seguro de vida obligatorio", value: lifeInsurance, min: 0 },
      { name: "other", label: "Otros costos mensuales", value: otherCosts, min: 0 },
      { name: "vacation", label: "Días de vacaciones anuales", value: vacationDays, required: true, min: 0, max: 365, integer: true },
    ]);
    if (!validation.valid || validation.values.salary <= 0) {
      setError(validation.firstError || "El sueldo bruto debe ser mayor que cero.");
      setResults(null);
      return;
    }
    setError("");
    setResults(draft);
  }

  return <main>
    <CalculatorHeader eyebrow="Empleo · Argentina" title="Calculadora de costo laboral" description="Estimá el costo mensual de contratar a una persona en relación de dependencia, con cargas patronales, obra social, ART y provisiones." />
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <CalculatorForm onSubmit={submit} error={error}>
        <MoneyField label="Sueldo bruto mensual" value={grossSalary} onChange={setGrossSalary} />
        <SelectField label="Tipo de empleador" value={employerType} onChange={(value) => setEmployerType(value as EmployerType)} hint="Referencia general. Beneficios, detracciones y regímenes especiales pueden modificar la carga efectiva.">
          <option value="general">Empleador general / MiPyME · 18%</option>
          <option value="large-services">Servicios o comercio por encima del límite MiPyME · 20,4%</option>
          <option value="custom">Usar porcentaje personalizado</option>
        </SelectField>
        {employerType === "custom" ? <PercentField label="Contribuciones de seguridad social" value={customSocialRate} onChange={setCustomSocialRate} /> : <PercentField label="Contribuciones de seguridad social" value={String(socialSecurityRate).replace(".", ",")} onChange={() => undefined} disabled />}
        <PercentField label="Contribución a obra social" value={healthInsuranceRate} onChange={setHealthInsuranceRate} hint="Se muestra separada de la tasa de seguridad social." />
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-semibold">ART y conceptos variables</p>
          <p className="mt-1 text-xs leading-5 text-white/45">La ART depende de la aseguradora, actividad y nivel de riesgo.</p>
          <div className="mt-4 grid gap-4">
            <PercentField label="ART variable estimada" value={artRate} onChange={setArtRate} />
            <MoneyField label="Componente fijo de ART" value={artFixed} onChange={setArtFixed} />
            <PercentField label="Contribución adicional de convenio" value={collectiveAgreementRate} onChange={setCollectiveAgreementRate} hint="Opcional" />
            <MoneyField label="Seguro de vida obligatorio" value={lifeInsurance} onChange={setLifeInsurance} hint="Cargá la prima mensual vigente" />
            <MoneyField label="Otros costos mensuales" value={otherCosts} onChange={setOtherCosts} hint="Beneficios, uniforme, medicina prepaga u otros" />
          </div>
        </div>
        <IntegerField label="Días de vacaciones anuales" value={vacationDays} onChange={setVacationDays} hint="Usamos 14 días como referencia inicial; ajustalo según antigüedad y convenio." />
      </CalculatorForm>
      <ResultsPanel hasResults={Boolean(results)} status={results ? <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">Costo completo mensualizado</p><p className="mt-2 text-lg font-semibold">{fmtNum(results.extraRate, 2)}% por encima del sueldo bruto</p></div> : null}>
        {results ? <ResultCards items={[
          { title: "Sueldo bruto", value: parseDigitsToNumber(grossSalary) },
          { title: "Seguridad social", value: results.socialSecurity, note: `${fmtNum(socialSecurityRate, 2)}%` },
          { title: "Obra social", value: results.healthInsurance, note: `${fmtNum(parseDecimalInput(healthInsuranceRate), 2)}%` },
          { title: "ART variable", value: results.artVariable, note: `Más componente fijo de ART: $${new Intl.NumberFormat("es-AR").format(parseDigitsToNumber(artFixed))}` },
          { title: "Contribución de convenio", value: results.collectiveAgreement },
          { title: "Costo mensual de caja", value: results.monthlyCashCost, note: "Sin provisiones de SAC y plus vacacional" },
          { title: "Provisión mensual de SAC", value: results.sacProvision },
          { title: "Cargas sobre el SAC", value: results.sacCharges },
          { title: "Provisión de plus vacacional", value: results.vacationPlusProvision },
          { title: "Costo mensual completo", value: results.annualizedMonthlyCost, note: "Costo anual estimado dividido por 12" },
          { title: "Costo adicional sobre el bruto", value: results.extraOverGross },
        ]} /> : null}
      </ResultsPanel>
    </div>
    <ExplainGrid>
      <ExplainCard title="Cómo se calcula">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Sumamos al sueldo bruto las contribuciones de seguridad social, obra social, ART, convenio y costos fijos ingresados.</li>
          <li>Ese resultado forma el costo mensual de caja aproximado.</li>
          <li>Para el costo completo agregamos la provisión mensual del aguinaldo, sus cargas y el plus vacacional estimado.</li>
        </ol>
      </ExplainCard>
      <ExplainCard title="Alcance de la estimación" warning>
        <p>No es una liquidación oficial de cargas sociales. Topes, detracciones, beneficios, convenio colectivo, actividad, ART, modalidad de contratación y conceptos no remunerativos pueden cambiar el costo real.</p>
      </ExplainCard>
    </ExplainGrid>
    <div className="mt-10 space-y-6">
      <SeoSection title="¿Cuánto cuesta un empleado en Argentina?">
        <p>El costo de un empleado no termina en el sueldo bruto. El empleador también afronta contribuciones patronales, obra social, ART, seguros y posibles obligaciones del convenio colectivo.</p>
      </SeoSection>
      <SeoSection title="Diferencia entre costo de caja y costo laboral completo">
        <p>El costo de caja representa los conceptos habituales del mes. El costo completo mensualiza obligaciones anuales como el sueldo anual complementario y el plus vacacional, ayudando a preparar un presupuesto más realista.</p>
      </SeoSection>
      <SeoSection title="Contribuciones patronales usadas como referencia">
        <p>La calculadora ofrece las tasas generales del 18% y 20,4% informadas por <a className="font-semibold text-emerald-200 hover:text-emerald-100" href="https://www.arca.gob.ar/relaciones-laborales/empleadores/aportes-y-contribuciones.asp" target="_blank" rel="noreferrer">ARCA</a>, y muestra la obra social por separado. Todos los porcentajes variables pueden ajustarse.</p>
      </SeoSection>
    </div>
  </main>;
}
