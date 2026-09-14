import { expect, test } from "@playwright/test";

test("las acciones se muestran desde el inicio y solo usan resultados vigentes", async ({ page }) => {
  await page.goto("/costo-laboral");

  const resultPanel = page.locator("[data-calculator-results]");
  const salary = page.getByRole("textbox", { name: "Sueldo bruto mensual" });

  await expect(resultPanel).toHaveAttribute("data-calculator-results", "empty");
  await expect(page.getByRole("button", { name: "Guardar escenario" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Comparar con otro escenario" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Calculá para analizar" })).toBeDisabled();

  await salary.fill("4000000");
  await page.getByRole("button", { name: "Comparar con otro escenario" }).click();
  await expect(page.getByText("Primero completá la calculadora para crear la comparación.")).toBeVisible();

  await page.getByRole("button", { name: "Calcular", exact: true }).click();

  await expect(resultPanel).toHaveAttribute("data-calculator-results", "ready");
  await expect(resultPanel.locator("[data-scenario-metric]")).toHaveCount(11);
  await expect(
    resultPanel.locator('[data-scenario-metric]:has([data-scenario-label]:text-is("Sueldo bruto")) [data-scenario-value]'),
  ).toContainText("4.000.000");
  await expect(page.getByRole("button", { name: "Guardar escenario" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Comparar con otro escenario" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Analizar este resultado" })).toBeVisible();

  await salary.fill("4500000");

  await expect(page.getByRole("button", { name: "Guardar escenario" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Comparar con otro escenario" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Calculá para analizar" })).toBeDisabled();
});
