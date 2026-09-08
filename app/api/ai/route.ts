import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  describeInvalidProviderResponse,
  describeProviderFailure,
  extractOpenAIError,
  extractOpenAIText,
  parseJsonPayload,
  type ProviderFailure,
} from "@/lib/ai/providerResponse";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_REQUEST_BYTES = 128 * 1024;
const OPENAI_TIMEOUT_MS = 45_000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(12000),
});

const RequestSchema = z.object({
  mode: z.enum(["analysis", "chat"]),
  context: z.object({
    calculatorType: z.string().trim().min(1).max(80),
    calculatorName: z.string().trim().min(1).max(120),
    calculatorPath: z.string().trim().min(1).max(200),
    inputs: z.record(z.string(), z.unknown()),
    results: z.record(z.string(), z.unknown()),
  }),
  messages: z.array(MessageSchema).max(30).default([]),
  message: z.string().trim().min(1).max(4000).optional(),
}).superRefine((body, context) => {
  if (body.mode === "chat" && !body.message) {
    context.addIssue({ code: "custom", path: ["message"], message: "Chat message is required" });
  }
});

type QuotaResult = {
  allowed: boolean;
  used: number;
  quota_limit: number;
  resets_at: string;
  plan?: "free" | "pro";
  usage_event_id?: number | string | null;
};

type ErrorOptions = {
  quota?: {
    used: number;
    limit: number;
    resetsAt: string;
    plan: "free" | "pro";
  };
};

const instructions = `Sos el Asistente IA de Calculadora Emprendedora, especializado en negocios, costos, precios, rentabilidad, inversiones y planificación financiera para usuarios de Argentina y Latinoamérica. Respondé en español rioplatense natural, claro y respetuoso.

Reglas: basate solamente en los datos provistos; nunca inventes cifras. Diferenciá hechos, cálculos, supuestos y estimaciones. Si falta un dato decisivo, preguntalo. Podés hacer simulaciones matemáticas solicitadas por el usuario, mostrando qué cambió y comparando contra el escenario original. No modifiques los datos originales. No des garantías ni te presentes como contador o asesor financiero. Para decisiones sensibles, indicá qué conviene validar profesionalmente. Mantenete enfocado en temas de la plataforma.

En modo análisis entregá un informe completo con: resumen ejecutivo, lectura de los números, fortalezas, riesgos y alertas, oportunidades, escenarios o sensibilidad relevantes, plan de acción priorizado por impacto y dificultad, preguntas que conviene responder y conclusión. Usá títulos simples y viñetas, sin tablas salvo que aporten claridad.

En modo chat respondé libremente usando el contexto del cálculo y la conversación previa. Cuando el usuario pida simular un cambio, incluí valores anteriores, nuevos valores, diferencia y una interpretación práctica.`;

function resolveRequestId(request: Request) {
  const provided = request.headers.get("x-client-request-id")?.trim();
  return provided && UUID_PATTERN.test(provided) ? provided : randomUUID();
}

function responseHeaders(requestId: string) {
  return {
    "Cache-Control": "no-store",
    "X-Request-Id": requestId,
  };
}

function errorResponse(
  requestId: string,
  status: number,
  code: string,
  message: string,
  retryable: boolean,
  options?: ErrorOptions,
) {
  return NextResponse.json(
    { error: message, code, retryable, requestId, ...(options?.quota ? { quota: options.quota } : {}) },
    { status, headers: responseHeaders(requestId) },
  );
}

function providerErrorResponse(requestId: string, failure: ProviderFailure) {
  return errorResponse(requestId, failure.status, failure.code, failure.message, failure.retryable);
}

function formatResetDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function isQuotaResult(value: unknown): value is QuotaResult {
  if (!value || typeof value !== "object") return false;
  const quota = value as Partial<QuotaResult>;
  return typeof quota.allowed === "boolean"
    && typeof quota.used === "number"
    && Number.isFinite(quota.used)
    && typeof quota.quota_limit === "number"
    && Number.isFinite(quota.quota_limit)
    && typeof quota.resets_at === "string";
}

async function readRequestPayload(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    return { ok: false as const, status: 415, code: "AI_UNSUPPORTED_MEDIA_TYPE", message: "La consulta debe enviarse en formato JSON." };
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return { ok: false as const, status: 413, code: "AI_REQUEST_TOO_LARGE", message: "La consulta supera el tamaño permitido." };
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { ok: false as const, status: 400, code: "AI_INVALID_BODY", message: "No pudimos leer los datos enviados." };
  }

  if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) {
    return { ok: false as const, status: 413, code: "AI_REQUEST_TOO_LARGE", message: "La consulta supera el tamaño permitido." };
  }

  const parsedJson = parseJsonPayload(raw);
  if (parsedJson === null) {
    return { ok: false as const, status: 400, code: "AI_INVALID_JSON", message: "Los datos enviados no contienen un JSON válido." };
  }

  const parsedBody = RequestSchema.safeParse(parsedJson);
  if (!parsedBody.success) {
    return { ok: false as const, status: 400, code: "AI_INVALID_REQUEST", message: "Los datos enviados no son válidos." };
  }

  return { ok: true as const, body: parsedBody.data };
}

async function releaseQuotaReservation(
  eventId: number | string | null | undefined,
  userId: string,
  requestId: string,
) {
  if (!eventId) return false;

  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin
      .from("ai_usage_events")
      .delete()
      .eq("id", eventId)
      .eq("user_id", userId)
      .in("usage_kind", ["analysis", "chat"])
      .select("id")
      .maybeSingle();

    if (error || !data?.id) {
      console.error("AI quota release failed", { requestId, eventId, code: error?.code });
      return false;
    }
    return true;
  } catch (error) {
    console.error("AI quota release failed", {
      requestId,
      eventId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return false;
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  let reservation: { eventId: number | string | null | undefined; userId: string } | null = null;
  let reservationCommitted = false;
  let releaseStarted = false;

  const releaseReservation = async () => {
    if (!reservation || reservationCommitted || releaseStarted) return false;
    releaseStarted = true;
    return releaseQuotaReservation(reservation.eventId, reservation.userId, requestId);
  };

  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!token || !url || !anonKey) {
      return errorResponse(requestId, 401, "AI_AUTH_REQUIRED", "Necesitás iniciar sesión.", false);
    }

    const payload = await readRequestPayload(request);
    if (!payload.ok) {
      return errorResponse(requestId, payload.status, payload.code, payload.message, false);
    }

    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return errorResponse(requestId, 401, "AI_SESSION_EXPIRED", "Tu sesión venció. Volvé a ingresar.", false);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("AI configuration missing", { requestId, variable: "OPENAI_API_KEY" });
      return errorResponse(requestId, 503, "AI_NOT_CONFIGURED", "La IA no está disponible en este momento.", false);
    }

    const { data: quotaRows, error: quotaError } = await supabase.rpc("consume_ai_quota", { p_kind: payload.body.mode });
    if (quotaError) {
      console.error("AI quota check failed", { requestId, code: quotaError.code });
      return errorResponse(
        requestId,
        503,
        "AI_QUOTA_UNAVAILABLE",
        "No pudimos verificar tu disponibilidad en este momento. Volvé a intentar en unos segundos.",
        true,
      );
    }

    const quotaCandidate = Array.isArray(quotaRows) ? quotaRows[0] : null;
    if (!isQuotaResult(quotaCandidate)) {
      console.error("AI quota response invalid", { requestId });
      return errorResponse(
        requestId,
        503,
        "AI_QUOTA_INVALID_RESPONSE",
        "No pudimos verificar tu disponibilidad en este momento. Volvé a intentar en unos segundos.",
        true,
      );
    }

    const quota = quotaCandidate;
    const plan: "free" | "pro" = quota.plan === "pro" ? "pro" : "free";
    const publicQuota = {
      used: quota.used,
      limit: quota.quota_limit,
      resetsAt: quota.resets_at,
      plan,
    };

    if (!quota.allowed) {
      const reset = formatResetDate(quota.resets_at);
      const errorMessage = plan === "pro"
        ? payload.body.mode === "analysis"
          ? `Alcanzaste los 30 análisis mensuales de Pro.${reset ? ` Se renuevan el ${reset}.` : ""}`
          : `Alcanzaste los 300 mensajes mensuales de Pro.${reset ? ` Se renuevan el ${reset}.` : ""}`
        : payload.body.mode === "analysis"
          ? `Ya usaste el análisis semanal del plan gratuito.${reset ? ` Se habilita nuevamente el ${reset}.` : ""}`
          : `Alcanzaste los 5 mensajes diarios del plan gratuito.${reset ? ` Podés volver a escribir desde el ${reset}.` : ""}`;
      return errorResponse(requestId, 429, "AI_QUOTA_REACHED", errorMessage, false, { quota: publicQuota });
    }

    reservation = { eventId: quota.usage_event_id, userId: user.id };

    const context = `CALCULADORA Y ESCENARIO ACTUAL:\n${JSON.stringify(payload.body.context, null, 2)}`;
    const input = [
      { role: "developer", content: instructions },
      { role: "developer", content: context },
      ...payload.body.messages,
      {
        role: "user",
        content: payload.body.mode === "analysis"
          ? "Realizá ahora el análisis integral de este escenario."
          : payload.body.message ?? "Continuá el análisis.",
      },
    ];

    const providerController = new AbortController();
    let timedOut = false;
    const abortFromClient = () => providerController.abort();
    if (request.signal.aborted) abortFromClient();
    else request.signal.addEventListener("abort", abortFromClient, { once: true });
    const timeout = setTimeout(() => {
      timedOut = true;
      providerController.abort();
    }, OPENAI_TIMEOUT_MS);

    try {
      const aiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Client-Request-Id": requestId,
        },
        body: JSON.stringify({
          model: plan === "pro"
            ? process.env.OPENAI_PRO_MODEL || process.env.OPENAI_MODEL || "gpt-5.4-mini"
            : process.env.OPENAI_FREE_MODEL || "gpt-5-mini",
          input,
          max_output_tokens: payload.body.mode === "analysis" ? 4500 : 2200,
        }),
        cache: "no-store",
        signal: providerController.signal,
      });

      const providerRequestId = aiResponse.headers.get("x-request-id");
      const rawProviderBody = await aiResponse.text();
      const providerPayload = parseJsonPayload(rawProviderBody);

      if (!aiResponse.ok) {
        const released = await releaseReservation();
        const details = extractOpenAIError(providerPayload);
        console.error("OpenAI API error", {
          requestId,
          providerRequestId,
          status: aiResponse.status,
          code: details.code || details.type,
        });
        return providerErrorResponse(requestId, describeProviderFailure(providerPayload, aiResponse.status, released));
      }

      const text = extractOpenAIText(providerPayload);
      if (!text) {
        const released = await releaseReservation();
        console.error("OpenAI response invalid", {
          requestId,
          providerRequestId,
          contentType: aiResponse.headers.get("content-type"),
        });
        return providerErrorResponse(requestId, describeInvalidProviderResponse(released));
      }

      reservationCommitted = true;
      return NextResponse.json(
        { text, quota: publicQuota, requestId },
        { status: 200, headers: responseHeaders(requestId) },
      );
    } catch (error) {
      const released = await releaseReservation();
      const suffix = released
        ? " No descontamos este intento de tu plan."
        : " Si el intento aparece consumido, escribinos desde Contacto para revisarlo.";

      if (timedOut) {
        console.error("OpenAI request timed out", { requestId, timeoutMs: OPENAI_TIMEOUT_MS });
        return errorResponse(
          requestId,
          504,
          "AI_PROVIDER_TIMEOUT",
          `La IA tardó demasiado en responder. Volvé a intentar.${suffix}`,
          true,
        );
      }

      if (request.signal.aborted) {
        console.info("AI request cancelled by client", { requestId });
        return errorResponse(requestId, 408, "AI_REQUEST_CANCELLED", `La consulta fue cancelada.${suffix}`, true);
      }

      console.error("OpenAI request failed", {
        requestId,
        error: error instanceof Error ? error.message : "unknown",
      });
      return errorResponse(
        requestId,
        502,
        "AI_PROVIDER_CONNECTION_ERROR",
        `No pudimos conectar con la IA. Intentá nuevamente en unos minutos.${suffix}`,
        true,
      );
    } finally {
      clearTimeout(timeout);
      request.signal.removeEventListener("abort", abortFromClient);
    }
  } catch (error) {
    const released = await releaseReservation();
    console.error("AI route error", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    });
    const suffix = released ? " No descontamos este intento de tu plan." : "";
    return errorResponse(
      requestId,
      500,
      "AI_INTERNAL_ERROR",
      `Ocurrió un error al procesar la consulta.${suffix}`,
      true,
    );
  }
}
