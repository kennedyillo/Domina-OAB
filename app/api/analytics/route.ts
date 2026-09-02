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

    const { env } = await import("cloudflare:workers");
    await env.DB.prepare(
      `INSERT INTO analytics_events
       (event_type, path, session_id, referrer, utm_source, utm_medium, utm_campaign)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      eventType,
      path,
      sessionId,
      clean(body.referrer, 500),
      clean(body.utmSource, 120),
      clean(body.utmMedium, 120),
      clean(body.utmCampaign, 160),
    ).run();

    return new Response(null, { status:204 });
  } catch {
    return Response.json({ error:"Não foi possível registrar o evento." }, { status:500 });
  }
}
