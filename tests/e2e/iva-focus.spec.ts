import { expect, test } from "@playwright/test";

const greenFocusColor = "110, 231, 183";

test.describe("foco de campos de IVA", () => {
  for (const calculator of [
    { path: "/iva-producto", label: "Precio neto sin IVA" },
    { path: "/iva-mensual", label: "Ventas netas al 2,5%" },
  ]) {
    test(`${calculator.path} usa el foco neutro del contenedor`, async ({ page }) => {
      await page.goto(calculator.path);

      const input = page.getByRole("textbox", { name: calculator.label });
      await input.focus();
      await input.fill("1234,56");

      const focusStyles = await input.evaluate((element) => {
        const inputStyles = getComputedStyle(element);
        const shellStyles = getComputedStyle(element.parentElement!);
        return {
          inputOutline: inputStyles.outlineStyle,
          inputShadow: inputStyles.boxShadow,
          shellShadow: shellStyles.boxShadow,
        };
      });

      expect(focusStyles.inputOutline).toBe("none");
      expect(focusStyles.inputShadow).toBe("none");
      expect(focusStyles.shellShadow).not.toBe("none");
      expect(JSON.stringify(focusStyles)).not.toContain(greenFocusColor);
      await expect(input).toHaveValue("1.234,56");
    });
  }

  test("los demás controles de IVA por producto tampoco usan el recuadro verde", async ({ page }) => {
    await page.goto("/iva-producto");

    for (const control of [
      page.getByRole("combobox", { name: "Alícuota de IVA" }),
      page.getByRole("textbox", { name: "Cantidad de unidades" }),
    ]) {
      await control.focus();
      const styles = await control.evaluate((element) => {
        const computed = getComputedStyle(element);
        return `${computed.outlineStyle} ${computed.boxShadow}`;
      });

      expect(styles).toContain("none");
      expect(styles).not.toContain(greenFocusColor);
    }
  });
});
