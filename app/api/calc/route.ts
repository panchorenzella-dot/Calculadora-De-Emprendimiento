import { NextResponse } from "next/server";
import { z } from "zod";

const InputSchema = z.object({
  unidadesDia: z.number().finite().nonnegative(),
   diasAbiertosMes: z.number().finite().int().min(0).max(31), // 👈 max 31
  precioUnit: z.number().finite().nonnegative(),

  modoCosto: z.enum(["pct", "abs"]),
  costoPct: z.number().finite().min(0).max(100).optional(),
  costoUnitAbs: z.number().finite().nonnegative().optional(),

  costosFijosMes: z.number().finite().nonnegative(),
  inversionInicial: z.number().finite().nonnegative(),

  ivaModo: z.enum(["incluido", "no_incluido"]), // ✅ sin "no_se"
});

function ceilSafe(n: number) {
  return Number.isFinite(n) ? Math.ceil(n) : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = InputSchema.parse(body);

    const IVA_FACTOR = 1.21;

    const unidadesMes = input.unidadesDia * input.diasAbiertosMes;

    const ventasBrutas = unidadesMes * input.precioUnit;

    const ivaIncluido = input.ivaModo === "incluido";
    const ventasNetas = ivaIncluido ? ventasBrutas / IVA_FACTOR : ventasBrutas;

    const costoUnit =
      input.modoCosto === "pct"
        ? input.precioUnit * ((input.costoPct ?? 0) / 100)
        : (input.costoUnitAbs ?? 0);

    const costosVarMes = unidadesMes * costoUnit;
    const margenUnit = input.precioUnit - costoUnit;

    const margenBrutoMes = ventasNetas - costosVarMes;
    const gananciaMes = margenBrutoMes - input.costosFijosMes;

    const breakEvenUnidades =
      margenUnit > 0 ? ceilSafe(input.costosFijosMes / margenUnit) : null;

    const paybackMeses =
      gananciaMes > 0 ? input.inversionInicial / gananciaMes : null;

    const roiAnualPct =
      input.inversionInicial > 0 && gananciaMes > 0
        ? ((gananciaMes * 12) / input.inversionInicial) * 100
        : null;

    return NextResponse.json({
      ok: true,
      input,
      derived: { unidadesMes },
      results: {
        ventasBrutas,
        ventasNetas,
        costoUnit,
        margenUnit,
        costosVarMes,
        margenBrutoMes,
        gananciaMes,
        breakEvenUnidades,
        paybackMeses,
        roiAnualPct,
        ivaFactorUsado: IVA_FACTOR,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validación", details: err.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Error inesperado" },
      { status: 500 }
    );
  }
}
