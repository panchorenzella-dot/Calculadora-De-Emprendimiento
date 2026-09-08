import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateBusinessMargin } from "@/lib/calculations/business";

const InputSchema = z.object({
  unidadesDia: z.number().finite().nonnegative(),
  diasAbiertosMes: z.number().finite().int().min(0).max(31),
  precioUnit: z.number().finite().nonnegative(),

  modoCosto: z.enum(["pct", "abs"]),
  costoPct: z.number().finite().min(0).max(100).optional(),
  costoUnitAbs: z.number().finite().nonnegative().optional(),

  costosFijosMes: z.number().finite().nonnegative(),
  inversionInicial: z.number().finite().nonnegative(),

  ivaModo: z.enum(["incluido", "no_incluido"]),
});

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "El cuerpo de la solicitud no es un JSON válido." },
        { status: 400 },
      );
    }

    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Revisá los datos ingresados.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const input = parsed.data;
    const result = calculateBusinessMargin({
      unitsPerDay: input.unidadesDia,
      operatingDays: input.diasAbiertosMes,
      unitPrice: input.precioUnit,
      costMode: input.modoCosto,
      costPct: input.costoPct,
      unitCost: input.costoUnitAbs,
      monthlyFixedCosts: input.costosFijosMes,
      initialInvestment: input.inversionInicial,
      vatMode: input.ivaModo,
    });

    return NextResponse.json({
      ok: true,
      input,
      derived: { unidadesMes: result.unitsPerMonth },
      results: {
        ventasBrutas: result.grossRevenue,
        ventasNetas: result.netRevenue,
        costoUnit: result.unitCost,
        margenUnit: result.contributionPerUnit,
        costosVarMes: result.monthlyVariableCosts,
        margenBrutoMes: result.monthlyGrossProfit,
        gananciaMes: result.monthlyNetProfit,
        breakEvenUnidades: result.breakEvenUnits,
        paybackMeses: result.paybackMonths,
        roiAnualPct: result.annualRoiPct,
        ivaFactorUsado: result.vatFactor,
      },
    });
  } catch (err) {
    console.error("Margin calculation failed", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { ok: false, error: "No pudimos completar el cálculo. Volvé a intentar." },
      { status: 500 },
    );
  }
}
