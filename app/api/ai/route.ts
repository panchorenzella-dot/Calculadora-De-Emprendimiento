import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

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

const instructions = `Sos el Asistente IA de Calculadora Emprendedora, especializado en negocios, costos, precios, rentabilidad, inversiones y planificación financiera para usuarios de Argentina y Latinoamérica. Respondé en español rioplatense natural, claro y respetuoso.

Reglas: basate solamente en los datos provistos; nunca inventes cifras. Diferenciá hechos, cálculos, supuestos y estimaciones. Si falta un dato decisivo, preguntalo. Podés hacer simulaciones matemáticas solicitadas por el usuario, mostrando qué cambió y comparando contra el escenario original. No modifiques los datos originales. No des garantías ni te presentes como contador o asesor financiero. Para decisiones sensibles, indicá qué conviene validar profesionalmente. Mantenete enfocado en temas de la plataforma.

En modo análisis entregá un informe completo con: resumen ejecutivo, lectura de los números, fortalezas, riesgos y alertas, oportunidades, escenarios o sensibilidad relevantes, plan de acción priorizado por impacto y dificultad, preguntas que conviene responder y conclusión. Usá títulos simples y viñetas, sin tablas salvo que aporten claridad.

En modo chat respondé libremente usando el contexto del cálculo y la conversación previa. Cuando el usuario pida simular un cambio, incluí valores anteriores, nuevos valores, diferencia y una interpretación práctica.`;

function extractText(data: unknown) {
  const response = data as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (response.output_text) return response.output_text;
  return response.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("\n") ?? "";
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!token || !url || !anonKey) return NextResponse.json({ error: "Necesitás iniciar sesión." }, { status: 401 });
    const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Tu sesión venció. Volvé a ingresar." }, { status: 401 });

    const body = RequestSchema.parse(await request.json());
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "La IA todavía no está configurada. Falta agregar la clave de OpenAI." }, { status: 503 });
    const context = `CALCULADORA Y ESCENARIO ACTUAL:\n${JSON.stringify(body.context, null, 2)}`;
    const input = [
      { role: "developer", content: instructions },
      { role: "developer", content: context },
      ...body.messages,
      { role: "user", content: body.mode === "analysis" ? "Realizá ahora el análisis integral de este escenario." : body.message || "Continuá el análisis." },
    ];
    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.4-mini", input, max_output_tokens: body.mode === "analysis" ? 4500 : 2200 }),
    });
    const data = await aiResponse.json();
    if (!aiResponse.ok) {
      const detail = (data as { error?: { message?: string } }).error?.message;
      console.error("OpenAI API error", aiResponse.status, detail);
      return NextResponse.json({ error: "No pudimos generar la respuesta en este momento." }, { status: 502 });
    }
    const text = extractText(data);
    if (!text) return NextResponse.json({ error: "La IA no devolvió contenido. Intentá nuevamente." }, { status: 502 });
    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Los datos enviados no son válidos." }, { status: 400 });
    console.error("AI route error", error);
    return NextResponse.json({ error: "Ocurrió un error al procesar la consulta." }, { status: 500 });
  }
}
