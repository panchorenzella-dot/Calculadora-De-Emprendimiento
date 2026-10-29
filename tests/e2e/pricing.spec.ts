import { expect, test } from "@playwright/test";

test("muestra tres planes mensuales con Pro recomendado y FAQ ampliada", async ({ page }) => {
  await page.goto("/precios");

  await expect(page.getByRole("heading", { level: 1, name: "Elegí la capacidad que necesita tu negocio hoy" })).toBeVisible();
  await expect(page.locator("#plan-basic")).toContainText("US$ 7.99");
  await expect(page.locator("#plan-pro")).toContainText("US$ 19.99");
  await expect(page.locator("#plan-pro")).toContainText("US$ 14.99");
  await expect(page.locator("#plan-pro")).toContainText("−25%");
  await expect(page.getByRole("heading", { name: "Plan Pro, ahora 25% menos" })).toBeVisible();
  await expect(page.getByText("Hasta el 31 de octubre", { exact: true })).toBeVisible();
  await expect(page.getByText("El precio especial se aplica automáticamente.", { exact: false })).toBeVisible();
  await expect(page.locator("#plan-premium")).toContainText("US$ 39.99");
  await expect(page.getByText("facturación mensual", { exact: false }).first()).toBeVisible();
  await expect(page.locator("details")).toHaveCount(10);

  const paymentsQuestion = page.getByText("¿Cómo se procesan los pagos?", { exact: true });
  await paymentsQuestion.click();
  await expect(page.getByText("La suscripción se confirma en PayPal", { exact: false })).toBeVisible();
});

test("el comparador pide registro con el mensaje comercial solicitado", async ({ page }) => {
  await page.goto("/margen");
  await page.getByRole("textbox", { name: "Unidades por día" }).fill("10");
  await page.getByRole("textbox", { name: "Días que abrís al mes" }).fill("20");
  await page.getByRole("textbox", { name: "Precio por unidad" }).fill("1000");
  await page.getByRole("textbox", { name: "Costo variable porcentual" }).fill("30");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();

  await expect(page.getByRole("button", { name: "Analizar este resultado" })).toBeEnabled();

  await page.getByRole("button", { name: "Comparar con otro escenario" }).click();
  await expect(page.getByRole("heading", { name: "Registrate gratis para guardar y comparar tus escenarios" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Crear mi cuenta gratis" })).toBeVisible();
});
