export type IvaModo = "incluido" | "no_incluido";
export type ModoCosto = "pct" | "abs";

export type CalcResponse = {
  ok: boolean;
  derived?: { unidadesMes: number };
  results?: {
    ventasBrutas: number;
    ventasNetas: number;
    costoUnit: number;
    margenUnit: number;
    costosVarMes: number;
    margenBrutoMes: number;
    gananciaMes: number;
    breakEvenUnidades: number | null;
    paybackMeses: number | null;
    roiAnualPct: number | null;
    ivaFactorUsado: number;
  };
  error?: string;
};
