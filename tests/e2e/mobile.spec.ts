import { expect, test } from "@playwright/test";

test("el catálogo mobile es estable, visible y no desborda", async ({ page }) => {
  await page.addInitScript(() => {
    let cumulativeLayoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) cumulativeLayoutShift += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });

    Object.defineProperty(window, "__e2eCumulativeLayoutShift", {
      get: () => cumulativeLayoutShift,
    });
  });

  await page.goto("/calculadoras");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('#calculator-results a[href^="/"]')).toHaveCount(20);
  const layout = await page.evaluate(() => ({
    cls: (window as Window & { __e2eCumulativeLayoutShift?: number }).__e2eCumulativeLayoutShift ?? 0,
    viewportWidth: document.documentElement.clientWidth,
    contentWidth: document.documentElement.scrollWidth,
  }));

  expect(layout.contentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.cls).toBeLessThan(0.1);
});

test("el flujo crítico de cálculo funciona en mobile", async ({ page }) => {
  await page.goto("/costo-laboral");

  await page.getByRole("textbox", { name: "Sueldo bruto mensual" }).fill("4000000");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();

  await expect(page.locator('[data-calculator-results="ready"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Guardar escenario" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Analizar este resultado" })).toBeVisible();
});
