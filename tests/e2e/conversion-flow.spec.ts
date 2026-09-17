import { expect, test } from "@playwright/test";
import { availableCalculators } from "../../app/calculadoras/catalog";

test("el hero calcula al escribir y conserva los importes al abrir y recargar el cálculo completo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Costo por unidad", exact: true }).fill("14.000,50");
  await page.getByRole("textbox", { name: "Precio de venta", exact: true }).fill("25.000,75");
  const preview = page.getByRole("region", { name: "Resultado rápido por unidad" });
  await expect(preview).toContainText("44%");
  await expect(preview).toContainText("78,6%");
  await page.getByRole("link", { name: "Ver el cálculo completo →", exact: true }).click();
  await expect(page).toHaveURL(/\/markup\?costo=14000\.5&precio=25000\.75$/);
  await page.reload();
  await expect(page.getByRole("radio", { name: /Ya tengo un precio/ })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Costo del producto", exact: true })).toHaveValue("14.000,5");
  await expect(page.getByRole("textbox", { name: "Precio de venta actual", exact: true })).toHaveValue("25.000,75");
  await page.getByRole("button", { name: "Calcular ganancia estimada", exact: true }).click();
  await expect(page.locator('[data-calculator-results="ready"]')).toContainText("11.000");
  await expect(page.getByRole("complementary", { name: "Próximo paso para tu negocio" })).toHaveCount(0);
});

test("el toggle conserva el precio y valida márgenes imposibles con comisiones", async ({ page }) => {
  await page.goto("/markup");
  await page.getByRole("textbox", { name: "Costo del producto", exact: true }).fill("10000");
  await page.getByRole("textbox", { name: "Markup deseado", exact: true }).fill("80");
  await expect(page.getByText("80% markup = 44,44% margen", { exact: true })).toBeVisible();
  await page.getByText("Sobre precio (margen)", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Sobre precio (margen)", exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Calcular precio sugerido", exact: true }).click();
  await expect(page.locator('[data-calculator-results="ready"]')).toContainText("18.000");
  await page.getByRole("textbox", { name: "Margen deseado", exact: true }).fill("50");
  await expect(page.getByText("50% margen = 100% markup", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Calcular precio sugerido", exact: true }).click();
  await expect(page.locator('[data-calculator-results="ready"]')).toContainText("20.000");
  await page.getByText("Cálculo completo", { exact: true }).click();
  await page.getByRole("textbox", { name: "Comisión por venta", exact: true }).fill("10");
  await page.getByRole("textbox", { name: "Margen deseado", exact: true }).fill("20");
  await page.getByRole("button", { name: "Calcular precio sugerido", exact: true }).click();
  await expect(page.locator('[data-calculator-results="ready"]')).toContainText("14.286");
  await page.getByRole("textbox", { name: "Margen deseado", exact: true }).fill("90");
  await page.getByRole("button", { name: "Calcular precio sugerido", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("menor al 100%");
  await expect(page.locator('[data-calculator-results="ready"]')).toHaveCount(0);
});

test("el flujo móvil admite ceros y descarta prefills inválidos sin desbordarse", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("textbox", { name: "Costo por unidad", exact: true }).fill("0");
  await page.getByRole("textbox", { name: "Precio de venta", exact: true }).fill("0");
  const preview = page.getByRole("region", { name: "Resultado rápido por unidad" });
  await expect(preview).toContainText("Sin ganancia");
  await expect(preview).toContainText("—");
  await page.getByRole("link", { name: "Ver el cálculo completo →", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Costo del producto", exact: true })).toHaveValue("0");
  await page.getByRole("button", { name: "Calcular ganancia estimada", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("mayor que cero");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
  await page.goto("/markup?costo=Infinity&precio=-50");
  await expect(page.getByRole("textbox", { name: "Costo del producto", exact: true })).toHaveValue("");
  await expect(page.getByRole("radio", { name: /Quiero definir un precio/ })).toBeChecked();
});

test("las recomendaciones funcionan con almacenamiento bloqueado y el mismo cálculo no cuenta dos veces", async ({ page }) => {
  await page.addInitScript(() => {
    const originalGet = Storage.prototype.getItem;
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "ce:business-next-step:v1") throw new Error("Storage blocked");
      return originalGet.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "ce:business-next-step:v1") throw new Error("Storage blocked");
      return originalSet.call(this, key, value);
    };
  });
  await page.goto("/markup?costo=10000&precio=5000");
  const nextStep = page.getByRole("complementary", { name: "Próximo paso para tu negocio" });
  await page.getByRole("button", { name: "Calcular ganancia estimada", exact: true }).click();
  await expect(page.locator('[data-calculator-results="ready"]')).toBeVisible();
  await expect(nextStep).toHaveCount(0);
  await page.getByRole("button", { name: "Calcular ganancia estimada", exact: true }).click();
  await expect(nextStep).toHaveCount(0);
  await page.getByRole("textbox", { name: "Precio de venta actual", exact: true }).fill("6000");
  await page.getByRole("button", { name: "Calcular ganancia estimada", exact: true }).click();
  await expect(nextStep.getByRole("link", { name: /Hacer el Diagnóstico 360°/ })).toBeVisible();
});

test("margen y punto de equilibrio recomiendan después de calcular y retiran el paso al editar los datos", async ({ page }) => {
  await page.goto("/margen");
  const nextStep = page.getByRole("complementary", { name: "Próximo paso para tu negocio" });
  await page.getByRole("textbox", { name: "Unidades por día", exact: true }).fill("10");
  await page.getByRole("textbox", { name: "Días que abrís al mes", exact: true }).fill("20");
  await page.getByRole("textbox", { name: "Precio por unidad", exact: true }).fill("1000");
  await page.getByRole("textbox", { name: "Costo variable porcentual", exact: true }).fill("30");
  await page.getByRole("textbox", { name: "Costos fijos / mes", exact: true }).fill("10000");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(nextStep.getByRole("link", { name: /Explorar Compra Negocio/ })).toBeVisible();
  await page.getByRole("textbox", { name: "Unidades por día", exact: true }).fill("1");
  await expect(nextStep).toHaveCount(0);
  await expect(page.locator('[data-calculator-results="ready"]')).toHaveCount(0);
  await page.goto("/punto-de-equilibrio");
  await page.getByRole("textbox", { name: "Costos fijos mensuales", exact: true }).fill("10000");
  await page.getByRole("textbox", { name: "Precio de venta por unidad", exact: true }).fill("1000");
  await page.getByRole("textbox", { name: "Costo variable por unidad", exact: true }).fill("300");
  await page.getByRole("textbox", { name: "Unidades estimadas por mes", exact: true }).fill("200");
  await page.getByRole("button", { name: /Calcular/ }).click();
  await expect(nextStep.getByRole("link", { name: /Explorar Compra Negocio/ })).toBeVisible();
  await page.getByRole("textbox", { name: "Unidades estimadas por mes", exact: true }).fill("1");
  await expect(nextStep).toHaveCount(0);
});

test("la home permite llegar al catálogo completo y todas las páginas ofrecen herramientas relacionadas", async ({ page, request }) => {
  await page.goto("/");
  await page.getByRole("link", { name: `Ver las ${availableCalculators.length} calculadoras →`, exact: true }).click();
  const catalog = page.locator("#calculator-results");
  await expect(catalog.locator("a")).toHaveCount(availableCalculators.length);
  await expect(catalog.locator('a[href="/iva-producto"]')).toBeVisible();
  await catalog.locator('a[href="/iva-producto"]').click();
  await expect(page).toHaveURL(/\/iva-producto$/);
  for (const calculator of availableCalculators) {
    const response = await request.get(calculator.href);
    const html = await response.text();
    expect(response.ok(), calculator.href).toBeTruthy();
    expect(html, calculator.href).toContain('id="related-calculators-title"');
  }
  const related = page.getByRole("region", { name: "Seguí con estos cálculos" });
  await expect(related.getByRole("link")).toHaveCount(2);
  await related.locator('a[href="/iva-mensual"]').click();
  await expect(page).toHaveURL(/\/iva-mensual$/);
});

test("el próximo paso depende del resultado y dos escenarios débiles distintos activan el diagnóstico", async ({ page }) => {
  await page.goto("/markup");
  const nextStep = page.getByRole("complementary", { name: "Próximo paso para tu negocio" });
  await expect(nextStep).toHaveCount(0);
  await page.getByText("Cálculo completo", { exact: true }).click();
  await page.getByRole("textbox", { name: "Costo del producto", exact: true }).fill("10000");
  await page.getByRole("textbox", { name: "Costos fijos mensuales", exact: true }).fill("100000");
  await page.getByRole("textbox", { name: "Unidades vendidas por mes", exact: true }).fill("100");
  await page.getByRole("textbox", { name: "Markup deseado", exact: true }).fill("80");
  await page.getByRole("button", { name: "Calcular precio sugerido", exact: true }).click();
  await expect(nextStep.getByRole("link", { name: /Explorar Compra Negocio/ })).toHaveAttribute("href", "https://www.compranegocio.com");
  await page.getByText("Ya tengo un precio", { exact: true }).click();
  await expect(nextStep).toHaveCount(0);
  await page.getByRole("textbox", { name: "Precio de venta actual", exact: true }).fill("5000");
  await page.getByRole("button", { name: "Calcular ganancia estimada", exact: true }).click();
  await expect(page.locator('[data-calculator-results="ready"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(sessionStorage.getItem("ce:business-next-step:v1") ?? "{}").count)).toBe(1);
  await expect(nextStep).toHaveCount(0);
  await page.getByRole("button", { name: "Calcular ganancia estimada", exact: true }).click();
  await expect(nextStep).toHaveCount(0);
  await page.getByRole("textbox", { name: "Precio de venta actual", exact: true }).fill("6000");
  await page.getByRole("button", { name: "Calcular ganancia estimada", exact: true }).click();
  await expect(nextStep.getByRole("link", { name: /Hacer el Diagnóstico 360°/ })).toHaveAttribute("href", "https://www.growtella.com/diagnostico");
  await page.reload();
  await expect(nextStep).toHaveCount(0);
  await page.getByRole("textbox", { name: "Costo del producto", exact: true }).fill("10000");
  await page.getByRole("textbox", { name: "Markup deseado", exact: true }).fill("0");
  await page.getByRole("button", { name: "Calcular precio sugerido", exact: true }).click();
  await expect(nextStep).toHaveCount(0);
});
