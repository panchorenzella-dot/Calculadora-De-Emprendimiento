import { createHash, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  requestType: z.enum(["withdrawal", "cancellation"]),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  details: z.string().trim().max(1000).optional().or(z.literal("")),
  website: z.string().max(0).optional().or(z.literal("")),
});

function requestCode(type: "withdrawal" | "cancellation") {
  const prefix = type === "withdrawal" ? "ARR" : "BAJA";
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `${prefix}-${date}-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = RequestSchema.parse(await request.json());
    if (body.website) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });

    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = createHash("sha256").update(`consumer-request:${forwardedFor}`).digest("hex");
    const admin = createSupabaseAdmin();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await admin
      .from("consumer_requests")
      .select("id", { count: "exact", head: true })
      .eq("request_ip_hash", ipHash)
      .gte("created_at", oneHourAgo);
    if (countError) throw countError;
    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: "Alcanzaste el límite temporal de solicitudes. Intentá más tarde." }, { status: 429 });
    }

    const code = requestCode(body.requestType);
    const { error } = await admin.from("consumer_requests").insert({
      code,
      request_type: body.requestType,
      full_name: body.fullName,
      email: body.email.toLowerCase(),
      reference: body.reference || null,
      details: body.details || null,
      request_ip_hash: ipHash,
    });
    if (error) throw error;

    return NextResponse.json({ code }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Revisá los datos ingresados." }, { status: 400 });
    }
    console.error("Consumer request error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "No pudimos registrar la solicitud en este momento." }, { status: 500 });
  }
}
