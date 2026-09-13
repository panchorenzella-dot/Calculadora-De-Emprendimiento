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

  test("mantiene el filtro inicial y los nombres accesibles completos", async ({ page }) => {
    await page.goto("/calculadoras?buscar=iva");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "¿Qué querés calcular?" })).toHaveValue("iva");
    await expect(page.getByRole("status")).toContainText("2 resultados");
    await expect(page.locator('#calculator-results a[href^="/"]')).toHaveCount(2);

    await page.getByRole("searchbox", { name: "¿Qué querés calcular?" }).fill("precio de venta");
    const priceLink = page.locator('a[href="/markup"]').first();
    await expect(priceLink).toHaveAccessibleName(
      /Precio de venta.*Definí cuánto cobrar.*Ideal para.*Productos, servicios y emprendimientos.*Usar calculadora/,
    );
  });
});
