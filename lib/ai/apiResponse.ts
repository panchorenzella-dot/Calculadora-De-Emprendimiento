import { isPlanName, type PlanName } from "../plans";

export type AiApiQuota = {
  used: number;
  limit: number | null;
  plan: PlanName;
  resetsAt?: string;
};

export type AiApiResponse = {
  text?: string;
  error?: string;
  code?: string;
  retryable?: boolean;
  requestId?: string;
  quota?: AiApiQuota;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export function parseAiApiResponse(raw: string): AiApiResponse | null {
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  if (!isRecord(value)) return null;

  let quota: AiApiQuota | undefined;
  if (isRecord(value.quota)) {
    const limit = value.quota.limit === null
      ? null
      : typeof value.quota.limit === "number"
      ? value.quota.limit
      : value.quota.quota_limit === null
        ? null
        : typeof value.quota.quota_limit === "number"
          ? value.quota.quota_limit
        : undefined;
    if (
      typeof value.quota.used === "number"
      && Number.isFinite(value.quota.used)
      && (limit === null || (typeof limit === "number" && Number.isFinite(limit)))
    ) {
      quota = {
        used: value.quota.used,
        limit,
        plan: isPlanName(value.quota.plan) ? value.quota.plan : "free",
        ...(typeof value.quota.resetsAt === "string" ? { resetsAt: value.quota.resetsAt } : {}),
      };
    }
  }

  return {
    text: optionalString(value.text),
    error: optionalString(value.error),
    code: optionalString(value.code),
    retryable: typeof value.retryable === "boolean" ? value.retryable : undefined,
    requestId: optionalString(value.requestId),
    ...(quota ? { quota } : {}),
  };
}
