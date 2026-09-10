import assert from "node:assert/strict";
import test from "node:test";

import {
  estimateOpenAICostUsd,
  extractOpenAIResponseMetadata,
  extractOpenAIUsage,
  resolveOpenAIModel,
} from "../lib/ai/telemetry";

test("extracts Responses API usage and metadata", () => {
  const payload = {
    id: "resp_123",
    model: "gpt-5.4-mini-2026-03-17",
    usage: {
      input_tokens: 1_200,
      input_tokens_details: { cached_tokens: 200 },
      output_tokens: 300,
      total_tokens: 1_500,
    },
  };

  assert.deepEqual(extractOpenAIResponseMetadata(payload), {
    responseId: "resp_123",
    model: "gpt-5.4-mini-2026-03-17",
  });
  assert.deepEqual(extractOpenAIUsage(payload), {
    inputTokens: 1_200,
    cachedInputTokens: 200,
    outputTokens: 300,
    totalTokens: 1_500,
  });
});

test("usage parsing rejects invalid counters and safely normalizes totals", () => {
  assert.equal(extractOpenAIUsage(null), null);
  assert.equal(extractOpenAIUsage({ usage: { input_tokens: -1, output_tokens: 3 } }), null);
  assert.equal(extractOpenAIUsage({ usage: { input_tokens: 2.5, output_tokens: 3 } }), null);

  assert.deepEqual(extractOpenAIUsage({
    usage: {
      input_tokens: 100,
      input_tokens_details: { cached_tokens: 150 },
      output_tokens: 25,
      total_tokens: 10,
    },
  }), {
    inputTokens: 100,
    cachedInputTokens: 100,
    outputTokens: 25,
    totalTokens: 125,
  });
});

test("calculates current OpenAI token costs including cached input", () => {
  const usage = {
    inputTokens: 1_000_000,
    cachedInputTokens: 200_000,
    outputTokens: 100_000,
    totalTokens: 1_100_000,
  };

  assert.equal(estimateOpenAICostUsd("gpt-5-mini", usage), 0.405);
  assert.equal(estimateOpenAICostUsd("gpt-5.4-mini-2026-03-17", usage), 1.065);
  assert.equal(estimateOpenAICostUsd("future-model", usage), null);
});

test("uses configured models and an accessible fallback for both plans", () => {
  assert.equal(resolveOpenAIModel("free", {
    freeModel: "custom-free",
    sharedModel: "shared-model",
  }), "custom-free");
  assert.equal(resolveOpenAIModel("pro", {
    proModel: "custom-pro",
    sharedModel: "shared-model",
  }), "custom-pro");
  assert.equal(resolveOpenAIModel("free", { sharedModel: "shared-model" }), "shared-model");
  assert.equal(resolveOpenAIModel("free", {}), "gpt-5.4-mini");
  assert.equal(resolveOpenAIModel("pro", {}), "gpt-5.4-mini");
});
