import { expect, test } from "@playwright/test";

import { availableCalculators } from "../../app/calculadoras/catalog";

test.describe("contrato de las calculadoras", () => {
  for (const calculator of availableCalculators) {
    test(`${calculator.title} expone formulario y estado de resultados`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      const response = await page.goto(calculator.href);

      expect(response?.ok()).toBeTruthy();
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator(".calculator-page-shell form").first()).toBeVisible();
      const resultPanel = page.locator(
        '.calculator-page-shell [data-calculator-results="empty"]',
      );
      await expect(resultPanel).toHaveCount(1);
      expect(pageErrors).toEqual([]);
    });
  }
});
