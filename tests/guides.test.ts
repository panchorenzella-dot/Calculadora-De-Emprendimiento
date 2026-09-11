import assert from "node:assert/strict";
import test from "node:test";

import { calculatorSections } from "../app/calculadoras/catalog";
import {
  getGuide,
  getGuidesByTopic,
  getRelatedGuides,
  guideTopics,
  guides,
} from "../lib/guides";

const expandedGuideSlugs = [
  "como-calcular-roi-inversion",
  "como-calcular-iva-mensual",
  "como-calcular-ingresos-brutos",
  "como-calcular-costo-laboral",
  "como-calcular-interes-compuesto",
  "como-calcular-rentabilidad-reventa",
  "como-calcular-costos-produccion",
];

test("guide catalog has unique slugs and valid calculator links", () => {
  assert.equal(new Set(guides.map((guide) => guide.slug)).size, guides.length);
  assert.equal(guides.length, 20);

  const calculatorPaths = new Set(
    calculatorSections.flatMap((section) =>
      section.calculators
        .filter((calculator) => !calculator.comingSoon)
        .map((calculator) => calculator.href),
    ),
  );

  for (const guide of guides) {
    assert.match(guide.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(guide.title.length > 20);
    assert.ok(guide.description.length > 50);
    assert.ok(guide.steps.length >= 3);
    assert.ok(guide.faqs.length >= 2);
    assert.ok(guide.formula?.expression);
    assert.ok((guide.pitfalls?.length ?? 0) >= 3);
    assert.match(guide.calculator.href, /^\/[a-z0-9-]+$/);
    assert.ok(calculatorPaths.has(guide.calculator.href));
    assert.equal(getGuide(guide.slug), guide);
  }
});

test("topic clusters cover every guide and create relevant internal links", () => {
  assert.equal(guideTopics.length, 4);

  for (const topic of guideTopics) {
    const topicGuides = getGuidesByTopic(topic.id);
    assert.ok(topicGuides.length >= 4);
    assert.ok(topicGuides.every((guide) => guide.topic === topic.id));

    for (const guide of topicGuides) {
      const related = getRelatedGuides(guide);
      assert.ok(related.length >= 3);
      assert.ok(
        related.every(
          (candidate) =>
            candidate.topic === guide.topic && candidate.slug !== guide.slug,
        ),
      );
    }
  }
});

test("priority SEO guides include formula, example, pitfalls and FAQs", () => {
  for (const slug of expandedGuideSlugs) {
    const guide = getGuide(slug);
    assert.ok(guide, `Missing guide: ${slug}`);
    assert.ok(guide.formula?.expression);
    assert.ok(guide.formula?.explanation);
    assert.ok(guide.example.copy.length > 60);
    assert.ok(guide.example.result.length > 20);
    assert.ok((guide.pitfalls?.length ?? 0) >= 3);
    assert.ok(guide.faqs.length >= 2);
  }
});

test("tax and labor guides link only to official reference sites", () => {
  const regulatedGuides = [
    "como-calcular-iva-mensual",
    "como-calcular-ingresos-brutos",
    "como-calcular-costo-laboral",
  ];

  for (const slug of regulatedGuides) {
    const guide = getGuide(slug);
    assert.ok(guide?.sources?.length);

    for (const source of guide.sources) {
      const hostname = new URL(source.href).hostname;
      assert.ok(
        hostname.endsWith("arca.gob.ar") ||
          hostname.endsWith("arba.gov.ar") ||
          hostname.endsWith("agip.gob.ar") ||
          hostname.endsWith("argentina.gob.ar"),
        `Unexpected source domain for ${slug}: ${hostname}`,
      );
    }
  }
});
