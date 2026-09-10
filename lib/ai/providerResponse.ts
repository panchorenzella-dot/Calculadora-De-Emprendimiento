type UnknownRecord = Record<string, unknown>;

export type OpenAIErrorDetails = {
  code?: string;
  message?: string;
  type?: string;
};

export type ProviderFailure = {
  code: string;
  message: string;
  retryable: boolean;
  status: 502 | 503 | 504;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function parseJsonPayload(raw: string): unknown | null {
  if (!raw.trim()) return null;

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function extractOpenAIText(payload: unknown) {
  if (!isRecord(payload)) return "";

  const directText = nonEmptyString(payload.output_text);
  if (directText) return directText;
  if (!Array.isArray(payload.output)) return "";

  const parts: string[] = [];
  for (const outputItem of payload.output) {
    if (!isRecord(outputItem) || !Array.isArray(outputItem.content)) continue;
    for (const contentItem of outputItem.content) {
      if (!isRecord(contentItem) || contentItem.type !== "output_text") continue;
      const text = nonEmptyString(contentItem.text);
      if (text) parts.push(text);
    }
  }

  return parts.join("\n");
}

export function extractOpenAIError(payload: unknown): OpenAIErrorDetails {
  if (!isRecord(payload) || !isRecord(payload.error)) return {};

  return {
    code: nonEmptyString(payload.error.code),
    message: nonEmptyString(payload.error.message),
    type: nonEmptyString(payload.error.type),
  };
}
function quotaSuffix(released: boolean) {
  return released
    ? " No descontamos este intento de tu plan."
    : " Si el intento aparece consumido, escribinos desde Contacto para revisarlo.";
}

export function describeProviderFailure(payload: unknown, providerStatus: number, released: boolean): ProviderFailure {
  const details = extractOpenAIError(payload);
  const providerCode = details.code || details.type;
  const suffix = quotaSuffix(released);

  if (providerCode === "insufficient_quota") {
    return {
      code: "AI_PROVIDER_QUOTA",
      message: `La IA alcanzó temporalmente el saldo disponible del servicio.${suffix}`,
      retryable: false,
      status: 503,
    };
  }

  if (providerCode === "model_not_found" || providerStatus === 404) {
    return {
      code: "AI_MODEL_UNAVAILABLE",
      message: `El modelo de IA configurado no está disponible en este momento.${suffix}`,
      retryable: false,
      status: 503,
    };
  }

  if (providerCode === "invalid_api_key" || providerStatus === 401 || providerStatus === 403) {
    return {
      code: "AI_PROVIDER_AUTH",
      message: `La conexión con la IA necesita una actualización.${suffix}`,
      retryable: false,
      status: 503,
    };
  }

  if (providerStatus === 429) {
    return {
      code: "AI_PROVIDER_RATE_LIMIT",
      message: `La IA está recibiendo demasiadas consultas. Esperá un momento y volvé a probar.${suffix}`,
      retryable: true,
      status: 503,
    };
  }

  if (providerStatus >= 500) {
    return {
      code: "AI_PROVIDER_UNAVAILABLE",
      message: `El servicio de IA no está respondiendo con normalidad. Volvé a intentar en unos minutos.${suffix}`,
      retryable: true,
      status: 503,
    };
  }

  return {
    code: "AI_PROVIDER_REJECTED",
    message: `No pudimos generar la respuesta en este momento.${suffix}`,
    retryable: false,
    status: 502,
  };
}

export function describeInvalidProviderResponse(released: boolean): ProviderFailure {
  return {
    code: "AI_PROVIDER_INVALID_RESPONSE",
    message: `La IA devolvió una respuesta inesperada. Volvé a intentar en unos minutos.${quotaSuffix(released)}`,
    retryable: true,
    status: 502,
  };
}
