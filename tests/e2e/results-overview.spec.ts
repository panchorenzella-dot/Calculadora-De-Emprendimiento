import { expect, test } from "@playwright/test";
import { availableCalculators } from "../../app/calculadoras/catalog";
import templates from "../../data/calculatorTemplates.json";

const exampleFields: Record<string, Record<string, string>> = {
  "/markup": { "Costo del producto": "10000", "Markup deseado": "80" },
  "/margen": { "Unidades por día": "10", "Días que abrís al mes": "20", "Precio por unidad": "1000", "Costo variable porcentual": "30", "Costos fijos / mes": "10000" },
  "/punto-de-equilibrio": { "Precio de venta por unidad": "1000", "Costo variable por unidad": "300", "Costos fijos mensuales": "10000" },
  "/interes-compuesto": { "Inversión inicial": "100000", "Tiempo": "2", "Tasa anual estimada": "10" },
  "/aporte-mensual": { "Capital inicial": "100000", "Aporte mensual inicial": "10000", "Tiempo": "2", "Rendimiento anual estimado": "10" },
  "/meta-ahorro": { "Meta de ahorro": "1000000", "Ahorro inicial": "100000", "Tiempo para llegar": "2" },
  "/recupero-capital": { "Inversión inicial": "1000000", "Ganancia mensual neta": "100000", "Meses de análisis": "12" },
  "/rendimiento-real": { "Monto inicial": "100000", "Monto final": "150000", "Inflación del período": "20" },
  "/roi-inversion": { "Inversión inicial": "100000", "Valor final": "150000" },
  "/roi": { "Inversión inicial": "100000", "Ingresos generados": "150000" },
  "/iva-producto": { "Precio neto sin IVA": "10000", "Cantidad de unidades": "2" },
  "/iva-mensual": { "Ventas netas al 21%": "100000", "Compras netas al 21%": "50000" },
  "/ingresos-brutos": { "Facturación gravada del período": "1000000", "Alícuota aplicable": "3" },
  "/costo-laboral": { "Sueldo bruto mensual": "1000000" },
};
const industryExamples = templates as Record<string, Array<{ values: Record<string, string> }>>;

for (const calculator of availableCalculators) {
  test(`${calculator.title}: tres resultados, desglose completo y valores estables al abrir y cerrar`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(calculator.href);
    for (const summary of await page.locator("[data-optional-fields] > summary").all()) await summary.click();
    const fields = exampleFields[calculator.href] ?? industryExamples[calculator.href]?.[0].values;
    expect(fields, calculator.href).toBeDefined();
    for (const [label, value] of Object.entries(fields)) {
      await page.getByRole("textbox", { name: label, exact: true }).fill(value);
    }
    // Closing optional fields must retain their contribution to the calculation.
    for (const summary of await page.locator("[data-optional-fields][open] > summary").all()) await summary.click();
    await page.locator(".calculator-page-shell form button[type='submit']").click();
    const result = page.locator('[data-calculator-results="ready"]');
    await expect(result).toBeVisible();
    const primary = result.locator("[data-primary-results] [data-scenario-metric]");
    await expect(primary).toHaveCount(3);
    for (const metric of await primary.all()) await expect(metric).toBeVisible();
    const visibleValues = await primary.allTextContents();
    const breakdown = result.locator("[data-results-breakdown]");
    await expect(breakdown).not.toHaveAttribute("open");
    const secondary = breakdown.locator("[data-scenario-metric]");
    expect(await secondary.count()).toBeGreaterThan(0);
    await expect(secondary.first()).toBeHidden();
    await breakdown.locator("summary").click();
    await expect(secondary.first()).toBeVisible();
    await expect(breakdown.getByText("Ocultar desglose", { exact: true })).toBeVisible();
    expect(await primary.allTextContents()).toEqual(visibleValues);
    await breakdown.locator("summary").click();
    await expect(secondary.first()).toBeHidden();
    expect(await primary.allTextContents()).toEqual(visibleValues);
    await expect(page.getByRole("button", { name: "Guardar escenario", exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("guardar con el desglose cerrado conserva todas las métricas antes de registrarse", async ({ page }) => {
  await page.goto("/costo-laboral");
  await page.getByRole("textbox", { name: "Sueldo bruto mensual" }).fill("4000000");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.getByRole("button", { name: "Analizar este resultado" })).toBeEnabled();
  await page.getByRole("button", { name: "Guardar escenario", exact: true }).click();
  await expect.poll(() => page.evaluate(() => {
    const pending = JSON.parse(sessionStorage.getItem("calculadora-emprendedora:pending-scenario") ?? "null");
    return Object.keys(pending?.results?.metricas ?? {}).length;
  })).toBe(11);
  const pending = await page.evaluate(() => JSON.parse(sessionStorage.getItem("calculadora-emprendedora:pending-scenario")!));
  expect(pending.results.metricas["Sueldo bruto"]).toContain("4.000.000");
  expect(pending.results.metricas["Provisión mensual de SAC"]).toBeTruthy();
});

test("los pagos a cuenta se aplican aunque el panel opcional esté cerrado", async ({ page }) => {
  await page.goto("/ingresos-brutos");
  await page.getByRole("textbox", { name: "Facturación gravada del período", exact: true }).fill("1000000");
  await page.getByRole("textbox", { name: "Alícuota aplicable", exact: true }).fill("3");
  await page.getByText("Añadir pagos a cuenta y saldos", { exact: true }).click();
  await page.getByRole("textbox", { name: "Retenciones sufridas", exact: true }).fill("5000");
  await page.getByText("Añadir pagos a cuenta y saldos", { exact: true }).click();
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  const due = page.locator('[data-primary-results] [data-scenario-metric]').filter({ hasText: "Ingresos Brutos a pagar" });
  await expect(due.locator("[data-scenario-value]")).toContainText("25.000");
});
