import { expect, test } from "@playwright/test";

test.describe("catálogo de calculadoras", () => {
  test("entrega el H1 y el catálogo desde el servidor", async ({ request }) => {
    const response = await request.get("/calculadoras");

    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toMatch(/<h1[^>]*>/);
    expect(html).toContain("calculadoras gratis para emprendedores y pymes");
    expect(html).toContain('href="/markup"');
  });

  test("muestra el catálogo completo en el orden solicitado y destaca margen", async ({ page }) => {
    await page.goto("/calculadoras?buscar=iva");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "¿Qué querés resolver hoy?" })).toHaveCount(0);
    await expect(page.locator("#calculator-results section[id] h2")).toHaveText([
      "Calculadoras por tipo de negocio",
      "Inversión y ahorro",
      "Precios, costos y rentabilidad",
      "Impuestos y costos en Argentina",
    ]);
    await expect(page.locator('#calculator-results a[href^="/"]')).toHaveCount(20);

    const featured = page.getByRole("link", { name: /Calculadora destacada.*Margen de ganancia/ });
    await expect(featured).toBeVisible();
    await expect(featured).toHaveAttribute("href", "/margen");
    await featured.click();
    await expect(page).toHaveURL(/\/margen$/);
  });
});
