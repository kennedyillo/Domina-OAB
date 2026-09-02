import { supabasePublicRpc } from "@/lib/supabase";

const ALLOWED_EVENTS = new Set(["page_view", "simulado_started", "simulado_completed"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
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

    await supabasePublicRpc("record_analytics", {
      p_event_type: eventType,
      p_path: path,
      p_session_id: sessionId,
      p_referrer: clean(body.referrer, 500),
      p_utm_source: clean(body.utmSource, 120),
      p_utm_medium: clean(body.utmMedium, 120),
      p_utm_campaign: clean(body.utmCampaign, 160),
    });

    return new Response(null, { status:204 });
  } catch {
    return Response.json({ error:"Não foi possível registrar o evento." }, { status:500 });
  }
}
