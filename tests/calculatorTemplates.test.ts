import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

type Template = {
  id: string;
  title: string;
  description: string;
  values: Record<string, string>;
};

const templates = JSON.parse(
  readFileSync(resolve(process.cwd(), "data/calculatorTemplates.json"), "utf8"),
) as Record<string, Template[]>;

test("industry templates cover every supported calculator with two editable examples", () => {
  assert.deepEqual(Object.keys(templates).sort(), [
    "/cafeteria",
    "/distribuidora",
    "/hamburgueseria",
    "/intermediarios",
    "/produccion",
    "/reventa",
  ]);
  assert.equal(Object.values(templates).flat().length, 12);
  for (const [path, entries] of Object.entries(templates)) {
    assert.equal(entries.length, 2, `${path} should have two templates`);
  }
});
test("template identifiers and numeric fields are valid", () => {
  const ids = new Set<string>();
  for (const template of Object.values(templates).flat()) {
    assert.ok(template.id.trim());
    assert.ok(!ids.has(template.id), `duplicate template id: ${template.id}`);
    ids.add(template.id);
    assert.ok(template.title.trim());
    assert.ok(template.description.trim());
    assert.ok(Object.keys(template.values).length >= 5);
    for (const [label, rawValue] of Object.entries(template.values)) {
      assert.ok(label.trim());
      const value = Number(rawValue);
      assert.ok(Number.isFinite(value) && value >= 0, `${template.id}/${label} is not a safe number`);
    }
  }
});
