import { expect, test } from "@playwright/test";

const pages = [
  { path: "/calculadoras", title: "Calculadoras de precios, costos y rentabilidad", h1: "Elegí qué necesitás calcular para tu negocio", description: "Calculá precios, costos, margen, impuestos e inversiones. Encontrá una herramienta gratuita según lo que necesitás resolver en tu negocio." },
  { path: "/hamburgueseria", title: "Calculadora de hamburguesas: costo y precio de venta", h1: "Calculá el costo y el precio de tus hamburguesas", description: "Sumá ingredientes, packaging, comisiones y gastos. Estimá el costo por hamburguesa, su precio de venta y el resultado mensual de tu negocio." },
  { path: "/punto-de-equilibrio", title: "Punto de equilibrio: calculá cuánto necesitás vender", h1: "Calculá cuánto vender para cubrir tus costos", description: "Ingresá precio, costo variable y costos fijos. Calculá tu punto de equilibrio en unidades y ventas para entender cuánto necesitás vender." },
  { path: "/costo-laboral", title: "Costo laboral: calculá el costo de un empleado", h1: "Calculá cuánto le cuesta un empleado a tu negocio", description: "Estimá el costo laboral en Argentina con sueldo bruto, contribuciones, ART, aguinaldo y vacaciones. Ajustá las tasas según tu caso." },
  { path: "/margen", title: "Calculadora de margen: ganancia sobre tus ventas", h1: "Calculá qué margen te dejan tus ventas", description: "Compará ventas y costos para estimar la ganancia y el margen de tu negocio. Entendé cuánto queda y qué gastos incluye el cálculo." },
];

for (const entry of pages) {
  test(`${entry.path}: SEO aprobado y encabezado adaptable`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(entry.path);
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(`${entry.title} | Calculadora Emprendedora`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(entry.h1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", entry.description);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", entry.title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", entry.description);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", entry.title);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", entry.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.calculadoraemprendedora.com${entry.path}`);
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
      await page.screenshot({ path: `artifacts/stage2/${entry.path.slice(1)}-${width}.png` });
    }
    expect(errors).toEqual([]);
  });
}

test("la home conserva su título y H1", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Calculadoras gratis para emprendedores | Precio y costos");
  await expect(page.locator("h1")).toHaveText("Entendé los números de tu negocio antes de decidir");
});

test("calculate cuenta resultados válidos, no carga, campos ni recálculos de una misma visita", async ({ page }) => {
  // No enviar pruebas a Google: comprobar la cola que consume gtag.
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort());
  const count = () => page.evaluate(() => (window.dataLayer ?? []).filter((entry: unknown) => {
    const event = entry as { 0?: string; 1?: string; event?: string };
    return event.event === "calculate" || (event[0] === "event" && event[1] === "calculate");
  }).length);
  await page.goto("/costo-laboral");
  await expect(page.getByRole("button", { name: "Guardar escenario", exact: true })).toBeVisible();
  expect(await count()).toBe(0);
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.locator('[data-calculator-results="ready"]')).toHaveCount(0);
  expect(await count()).toBe(0);
  const salary = page.getByRole("textbox", { name: "Sueldo bruto mensual", exact: true });
  await salary.fill("0");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.locator('[data-calculator-results="ready"]')).toHaveCount(0);
  expect(await count()).toBe(0);
  await salary.fill("1000000");
  expect(await count()).toBe(0);
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.locator('[data-calculator-results="ready"]')).toBeVisible();
  await expect.poll(count).toBe(1);
  await salary.fill("1200000");
  await expect(page.locator('[data-calculator-results="ready"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.locator('[data-calculator-results="ready"]')).toBeVisible();
  expect(await count()).toBe(1);
  await page.getByRole("link", { name: "Calculadoras", exact: true }).first().click();
  await page.locator('#calculator-results a[href="/costo-laboral"]').click();
  await expect(page.getByRole("button", { name: "Guardar escenario", exact: true })).toBeVisible();
  expect(await count()).toBe(1);
  await salary.fill("1000000");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect.poll(count).toBe(2);
});
