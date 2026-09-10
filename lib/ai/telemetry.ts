type UnknownRecord = Record<string, unknown>;

export type OpenAIUsage = {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type OpenAIModelEnvironment = {
  freeModel?: string;
  proModel?: string;
  sharedModel?: string;
};

type ModelPricing = {
  inputPerMillion: number;
  cachedInputPerMillion: number;
  outputPerMillion: number;
};

const MODEL_PRICING: ReadonlyArray<{
  matches: (model: string) => boolean;
  pricing: ModelPricing;
}> = [
  {
    matches: (model) => model === "gpt-5-mini" || model.startsWith("gpt-5-mini-"),
    pricing: {
      inputPerMillion: 0.25,
      cachedInputPerMillion: 0.025,
      outputPerMillion: 2,
    },
  },
  {
    matches: (model) => model === "gpt-5.4-mini" || model.startsWith("gpt-5.4-mini-"),
    pricing: {
      inputPerMillion: 0.75,
      cachedInputPerMillion: 0.075,
      outputPerMillion: 4.5,
    },
  },
];

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function tokenCount(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function configuredModel(value: string | undefined) {
  return value?.trim() || undefined;
}

export function resolveOpenAIModel(
  plan: "free" | "pro",
  environment: OpenAIModelEnvironment,
) {
  const sharedModel = configuredModel(environment.sharedModel);
  const planModel = configuredModel(plan === "pro" ? environment.proModel : environment.freeModel);

  return planModel || sharedModel || "gpt-5.4-mini";
}

export function extractOpenAIResponseMetadata(payload: unknown) {
  if (!isRecord(payload)) return { responseId: null, model: null };

  return {
    responseId: nonEmptyString(payload.id),
    model: nonEmptyString(payload.model),
  };
}

export function extractOpenAIUsage(payload: unknown): OpenAIUsage | null {
  if (!isRecord(payload) || !isRecord(payload.usage)) return null;

  const inputTokens = tokenCount(payload.usage.input_tokens);
  const outputTokens = tokenCount(payload.usage.output_tokens);
  if (inputTokens === null || outputTokens === null) return null;

  const reportedCachedTokens = isRecord(payload.usage.input_tokens_details)
    ? tokenCount(payload.usage.input_tokens_details.cached_tokens)
    : null;
  const cachedInputTokens = Math.min(reportedCachedTokens ?? 0, inputTokens);
  const minimumTotal = inputTokens + outputTokens;
  const reportedTotal = tokenCount(payload.usage.total_tokens);

  return {
    inputTokens,
    cachedInputTokens,
    outputTokens,
    totalTokens: Math.max(reportedTotal ?? minimumTotal, minimumTotal),
  };
}

export function estimateOpenAICostUsd(model: string, usage: OpenAIUsage) {
  const normalizedModel = model.trim().toLowerCase();
  const pricing = MODEL_PRICING.find((candidate) => candidate.matches(normalizedModel))?.pricing;
  if (!pricing) return null;

  const uncachedInputTokens = Math.max(0, usage.inputTokens - usage.cachedInputTokens);
  const cost = (
    uncachedInputTokens * pricing.inputPerMillion
    + usage.cachedInputTokens * pricing.cachedInputPerMillion
    + usage.outputTokens * pricing.outputPerMillion
  ) / 1_000_000;

  return Number(cost.toFixed(8));
}
