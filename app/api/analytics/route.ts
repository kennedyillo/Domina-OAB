import { clientIp,readJsonWithLimit } from "@/lib/public-api-security";
import { supabaseAdminRpc } from "@/lib/supabase";

const ALLOWED_EVENTS = new Set(["page_view", "simulado_started", "simulado_completed"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function error(body:Record<string,unknown>,status:number,headers?:Record<string,string>){
  return Response.json(body,{status,headers:{"Cache-Control":"no-store",...headers}});
}

export async function POST(request: Request) {
  try {
    const body=await readJsonWithLimit<Record<string,unknown>>(request,4*1024);
    const eventType = clean(body.eventType, 40);
    const sessionId = clean(body.sessionId, 80);
    const rawPath = clean(body.path, 300) || "/";
    const path=rawPath.startsWith("/")&&!rawPath.startsWith("//")?rawPath:"/";
    if (!ALLOWED_EVENTS.has(eventType) || !sessionId) {
      return error({ error:"Evento inválido." },400);
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

    return new Response(null, { status:204,headers:{"Cache-Control":"no-store"} });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "";
    if(message==="payload_too_large")return error({error:"Payload excede o limite permitido."},413);
    if(message==="invalid_json")return error({error:"Payload inválido."},400);
    if (message.includes("rate_limit_exceeded")) {
      return error({ error:"Muitos eventos em pouco tempo." },429);
    }
    return error({ error:"Não foi possível registrar o evento." },500);
  }
}
