import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdmin } from "@/lib/supabase/server";

const MessageSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(12000) });
const RequestSchema = z.object({
  mode: z.enum(["analysis", "chat"]),
  context: z.object({
    calculatorType: z.string().max(80), calculatorName: z.string().max(120), calculatorPath: z.string().max(200),
    inputs: z.record(z.string(), z.unknown()), results: z.record(z.string(), z.unknown()),
  }),
  messages: z.array(MessageSchema).max(30).default([]),
  message: z.string().max(4000).optional(),
});

type QuotaResult = {
  allowed: boolean;
  used: number;
  quota_limit: number;
  resets_at: string;
  plan?: "free" | "pro";
  usage_event_id?: number | string | null;
};

const instructions = `Sos el Asistente IA de Calculadora Emprendedora, especializado en negocios, costos, precios, rentabilidad, inversiones y planificación financiera para usuarios de Argentina y Latinoamérica. Respondé en español rioplatense natural, claro y respetuoso.

Reglas: basate solamente en los datos provistos; nunca inventes cifras. Diferenciá hechos, cálculos, supuestos y estimaciones. Si falta un dato decisivo, preguntalo. Podés hacer simulaciones matemáticas solicitadas por el usuario, mostrando qué cambió y comparando contra el escenario original. No modifiques los datos originales. No des garantías ni te presentes como contador o asesor financiero. Para decisiones sensibles, indicá qué conviene validar profesionalmente. Mantenete enfocado en temas de la plataforma.

En modo análisis entregá un informe completo con: resumen ejecutivo, lectura de los números, fortalezas, riesgos y alertas, oportunidades, escenarios o sensibilidad relevantes, plan de acción priorizado por impacto y dificultad, preguntas que conviene responder y conclusión. Usá títulos simples y viñetas, sin tablas salvo que aporten claridad.

En modo chat respondé libremente usando el contexto del cálculo y la conversación previa. Cuando el usuario pida simular un cambio, incluí valores anteriores, nuevos valores, diferencia y una interpretación práctica.`;

function extractText(data: unknown) {
  const response = data as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (response.output_text) return response.output_text;
  return response.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("\n") ?? "";
}

type OpenAIErrorResponse = {
  error?: {
    code?: string;
    message?: string;
    type?: string;
  };
};

function openAIErrorMessage(data: OpenAIErrorResponse, status: number, released: boolean) {
  const code = data.error?.code || data.error?.type;
  const suffix = released
    ? " No descontamos este intento de tu plan."
    : " Si el intento aparece consumido, escribinos desde Contacto para revisarlo.";

  if (code === "insufficient_quota") {
    return `La IA alcanzó temporalmente el saldo disponible del servicio.${suffix}`;
  }
  if (code === "invalid_api_key" || status === 401) {
    return `La conexión con la IA necesita una actualización.${suffix}`;
  }
  if (code === "model_not_found" || status === 404) {
    return `El modelo de IA configurado no está disponible en este momento.${suffix}`;
  }
  if (status === 429) {
    return `La IA está recibiendo demasiadas consultas. Esperá un momento y volvé a probar.${suffix}`;
  }
  return `No pudimos generar la respuesta en este momento.${suffix}`;
}

async function releaseQuotaReservation(eventId: number | string | null | undefined, userId: string) {
  if (!eventId) return false;

  try {
    const admin = createSupabaseAdmin();
    const { error } = await admin
      .from("ai_usage_events")
      .delete()
      .eq("id", eventId)
      .eq("user_id", userId)
      .in("usage_kind", ["analysis", "chat"]);

    if (error) {
      console.error("AI quota release error", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("AI quota release error", error instanceof Error ? error.message : "unknown");
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!token || !url || !anonKey) return NextResponse.json({ error: "Necesitás iniciar sesión." }, { status: 401 });
    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Tu sesión venció. Volvé a ingresar." }, { status: 401 });

    const body = RequestSchema.parse(await request.json());
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "La IA todavía no está configurada. Falta agregar la clave de OpenAI." }, { status: 503 });

    const { data: quotaRows, error: quotaError } = await supabase.rpc("consume_ai_quota", { p_kind: body.mode });
    if (quotaError) {
      console.error("AI quota error", quotaError.message);
      return NextResponse.json({ error: "No pudimos verificar tu límite. Revisá que estén aplicadas las migraciones de Supabase." }, { status: 503 });
    }
    const quota = (quotaRows as QuotaResult[] | null)?.[0];
    const plan = quota?.plan === "pro" ? "pro" : "free";
    if (!quota?.allowed) {
      const reset = quota?.resets_at
        ? new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", dateStyle: "medium", timeStyle: "short" }).format(new Date(quota.resets_at))
        : null;
      const errorMessage = plan === "pro"
        ? body.mode === "analysis"
          ? `Alcanzaste los 30 análisis mensuales de Pro.${reset ? ` Se renuevan el ${reset}.` : ""}`
          : `Alcanzaste los 300 mensajes mensuales de Pro.${reset ? ` Se renuevan el ${reset}.` : ""}`
        : body.mode === "analysis"
          ? `Ya usaste el análisis semanal del plan gratuito.${reset ? ` Se habilita nuevamente el ${reset}.` : ""}`
          : `Alcanzaste los 5 mensajes diarios del plan gratuito.${reset ? ` Podés volver a escribir desde el ${reset}.` : ""}`;
      return NextResponse.json({ error: errorMessage, code: "AI_QUOTA_REACHED", quota }, { status: 429 });
    }

    const context = `CALCULADORA Y ESCENARIO ACTUAL:\n${JSON.stringify(body.context, null, 2)}`;
    const input = [
      { role: "developer", content: instructions },
      { role: "developer", content: context },
      ...body.messages,
      { role: "user", content: body.mode === "analysis" ? "Realizá ahora el análisis integral de este escenario." : body.message || "Continuá el análisis." },
    ];
    try {
      const clientRequestId = randomUUID();
      const aiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Client-Request-Id": clientRequestId,
        },
        body: JSON.stringify({
          model: plan === "pro"
            ? process.env.OPENAI_PRO_MODEL || process.env.OPENAI_MODEL || "gpt-5.4-mini"
            : process.env.OPENAI_FREE_MODEL || "gpt-5-mini",
          input,
          max_output_tokens: body.mode === "analysis" ? 4500 : 2200,
        }),
      });
      const providerRequestId = aiResponse.headers.get("x-request-id");
      const data = await aiResponse.json() as OpenAIErrorResponse;
      if (!aiResponse.ok) {
        const released = await releaseQuotaReservation(quota.usage_event_id, user.id);
        console.error("OpenAI API error", aiResponse.status, data.error?.code, data.error?.message, { clientRequestId, providerRequestId });
        return NextResponse.json(
          { error: openAIErrorMessage(data, aiResponse.status, released), code: data.error?.code || "AI_PROVIDER_ERROR" },
          { status: aiResponse.status === 429 ? 503 : 502 }
        );
      }
      const text = extractText(data);
      if (!text) {
        const released = await releaseQuotaReservation(quota.usage_event_id, user.id);
        const suffix = released ? " No descontamos este intento de tu plan." : "";
        return NextResponse.json({ error: `La IA no devolvió contenido. Intentá nuevamente.${suffix}` }, { status: 502 });
      }
      return NextResponse.json({ text, quota: { used: quota.used, limit: quota.quota_limit, resetsAt: quota.resets_at, plan } });
    } catch (error) {
      const released = await releaseQuotaReservation(quota.usage_event_id, user.id);
      console.error("OpenAI request error", error instanceof Error ? error.message : "unknown");
      const suffix = released ? " No descontamos este intento de tu plan." : "";
      return NextResponse.json({ error: `No pudimos conectar con la IA. Intentá nuevamente en unos minutos.${suffix}` }, { status: 502 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Los datos enviados no son válidos." }, { status: 400 });
    console.error("AI route error", error);
    return NextResponse.json({ error: "Ocurrió un error al procesar la consulta." }, { status: 500 });
  }
}
