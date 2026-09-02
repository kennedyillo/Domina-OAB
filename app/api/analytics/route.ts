import { supabaseAdminRpc } from "@/lib/supabase";

const ALLOWED_EVENTS = new Set(["page_view", "simulado_started", "simulado_completed"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const eventType = clean(body.eventType, 40);
    const sessionId = clean(body.sessionId, 80);
    const path = clean(body.path, 300) || "/";
    if (!ALLOWED_EVENTS.has(eventType) || !sessionId) {
      return Response.json({ error:"Evento inválido." }, { status:400 });
    }

    await supabaseAdminRpc("record_analytics_server", {
      p_event_type: eventType,
      p_path: path,
      p_session_id: sessionId,
      p_referrer: clean(body.referrer, 500),
      p_utm_source: clean(body.utmSource, 120),
      p_utm_medium: clean(body.utmMedium, 120),
      p_utm_campaign: clean(body.utmCampaign, 160),
      p_client_ip: clientIp(request),
    });

    return new Response(null, { status:204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("rate_limit_exceeded")) {
      return Response.json({ error:"Muitos eventos em pouco tempo." }, { status:429 });
    }
    return Response.json({ error:"Não foi possível registrar o evento." }, { status:500 });
  }
}
