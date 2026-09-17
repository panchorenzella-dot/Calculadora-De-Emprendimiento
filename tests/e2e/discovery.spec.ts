import { expect, test } from "@playwright/test";
import { availableCalculators } from "../../app/calculadoras/catalog";

test("el sitemap incluye cada calculadora activa una sola vez y sus rutas responden", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  expect(new Set(urls).size).toBe(urls.length);

  for (const calculator of availableCalculators) {
    expect(urls).toContain(`https://www.calculadoraemprendedora.com${calculator.href}`);
    const page = await request.get(calculator.href);
    expect(page.ok(), calculator.href).toBeTruthy();
  }
  expect(urls.every((url) => !url.includes("/perfil") && !url.includes("/api/"))).toBeTruthy();
});

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`la home presenta tres destacadas y acceso al catálogo en ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const featured = page.getByRole("navigation", { name: "Calculadoras destacadas" });
    await expect(featured.getByRole("link")).toHaveCount(3);
    for (const href of ["/markup", "/margen", "/punto-de-equilibrio"]) {
      await expect(featured.locator(`a[href="${href}"]`)).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: /calculadoras, por objetivo/ })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Guías con fórmulas y casos paso a paso" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Más herramientas para tu negocio" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Guías", exact: true })).toBeVisible();
    const catalogLink = page.getByRole("link", { name: `Ver las ${availableCalculators.length} calculadoras →`, exact: true });
    await expect(catalogLink).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
    await catalogLink.click();
    await expect(page).toHaveURL(/\/calculadoras$/);
    await expect(page.locator('#calculator-results a[href^="/"]')).toHaveCount(availableCalculators.length);
  });
}

test("ambas calculadoras de IVA están visibles en la sección de impuestos", async ({ page }) => {
  await page.goto("/calculadoras");
  const taxes = page.locator("#calculator-results section").filter({
    has: page.getByRole("heading", { name: "Impuestos y costos en Argentina", exact: true }),
  });
  for (const href of ["/iva-producto", "/iva-mensual"]) {
    await expect(taxes.locator(`a[href="${href}"]`)).toBeVisible();
  }
  await taxes.locator('a[href="/iva-producto"]').click();
  await expect(page.getByRole("heading", { level: 1, name: "Calculadora de IVA por producto o servicio" })).toBeVisible();
});
