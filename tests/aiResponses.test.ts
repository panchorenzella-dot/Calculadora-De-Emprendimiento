import assert from "node:assert/strict";
import test from "node:test";

import { parseAiApiResponse } from "../lib/ai/apiResponse";
import {
  describeInvalidProviderResponse,
  describeProviderFailure,
  extractOpenAIError,
  extractOpenAIText,
  parseJsonPayload,
} from "../lib/ai/providerResponse";

test("client parser accepts current and legacy quota shapes", () => {
  const current = parseAiApiResponse(JSON.stringify({
    text: "Respuesta",
    requestId: "request-1",
    quota: { used: 2, limit: 5, plan: "pro", resetsAt: "2026-09-09T00:00:00Z" },
  }));
  assert.equal(current?.text, "Respuesta");
  assert.deepEqual(current?.quota, { used: 2, limit: 5, plan: "pro", resetsAt: "2026-09-09T00:00:00Z" });

  const legacy = parseAiApiResponse(JSON.stringify({ quota: { used: 1, quota_limit: 5, plan: "free" } }));
  assert.deepEqual(legacy?.quota, { used: 1, limit: 5, plan: "free" });
});

test("client and provider parsers tolerate malformed bodies", () => {
  assert.equal(parseAiApiResponse("not-json"), null);
  assert.equal(parseAiApiResponse("[]"), null);
  assert.equal(parseJsonPayload(""), null);
  assert.equal(parseJsonPayload("<html>error</html>"), null);
});

test("OpenAI text extraction supports direct and structured response payloads", () => {
  assert.equal(extractOpenAIText({ output_text: "Directa" }), "Directa");
  assert.equal(extractOpenAIText({
    output: [
      { content: [{ type: "output_text", text: "Primera" }, { type: "refusal", text: "omitida" }] },
      { content: [{ type: "output_text", text: "Segunda" }] },
    ],
  }), "Primera\nSegunda");
  assert.equal(extractOpenAIText({ output: [{ content: [] }] }), "");
});

test("provider errors are normalized without exposing provider messages", () => {
  assert.deepEqual(extractOpenAIError({ error: { code: "rate_limit", type: "requests", message: "private" } }), {
    code: "rate_limit",
    type: "requests",
    message: "private",
  });

  const quota = describeProviderFailure({ error: { code: "insufficient_quota" } }, 429, true);
  assert.equal(quota.code, "AI_PROVIDER_QUOTA");
  assert.equal(quota.retryable, false);
  assert.match(quota.message, /No descontamos/i);

  const auth = describeProviderFailure({}, 401, false);
  assert.equal(auth.code, "AI_PROVIDER_AUTH");
  assert.equal(auth.status, 503);

  const rate = describeProviderFailure({}, 429, true);
  assert.equal(rate.code, "AI_PROVIDER_RATE_LIMIT");
  assert.equal(rate.retryable, true);

  const unavailable = describeProviderFailure({}, 500, true);
  assert.equal(unavailable.code, "AI_PROVIDER_UNAVAILABLE");
  assert.equal(unavailable.retryable, true);

  const rejected = describeProviderFailure({}, 422, true);
  assert.equal(rejected.code, "AI_PROVIDER_REJECTED");
  assert.equal(rejected.retryable, false);
});

test("invalid successful provider responses become retryable stable failures", () => {
  const result = describeInvalidProviderResponse(true);
  assert.equal(result.code, "AI_PROVIDER_INVALID_RESPONSE");
  assert.equal(result.status, 502);
  assert.equal(result.retryable, true);
  assert.match(result.message, /No descontamos/i);
});
