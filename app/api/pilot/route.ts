import { supabaseAdminRpc } from "@/lib/supabase";

const FOUNDER_LIMIT = 25;
const MAX_BODY_BYTES = 4096;

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || null;
}

async function readLimitedJson(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new Error("payload_too_large");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new Error("payload_too_large");
  }

  return JSON.parse(text) as { email?: unknown; consent?: unknown };
}

type FounderResult = {
  status?: "founder";
  remaining: number;
  closed?: boolean;
  error?: string;
  inserted?: boolean;
  marketing_opt_in?: boolean;
};

export async function GET() {
  try {
    const result = await supabaseAdminRpc<FounderResult>("founder_availability");
    return Response.json({ remaining: result.remaining, limit: FOUNDER_LIMIT });
  } catch {
    return Response.json(
      { error: "Não foi possível consultar as vagas agora.", unavailable: true },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await readLimitedJson(request);
    const email = normalizeEmail(body.email);
    const marketingOptIn = body.consent === true;

    if (!validEmail(email)) {
      return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    const result = await supabaseAdminRpc<FounderResult>("register_founder_server_v2", {
      p_email: email,
      p_marketing_opt_in: marketingOptIn,
      p_consent_version: "2026-09",
      p_client_ip: clientIp(request),
    });

    if (result.closed) {
      return Response.json(
        { error: result.error ?? "As vagas gratuitas foram preenchidas.", closed: true, remaining: 0 },
        { status: 409 },
      );
    }

    return Response.json(
      {
        status: result.status ?? "founder",
        remaining: result.remaining,
        marketing_opt_in: result.marketing_opt_in ?? marketingOptIn,
      },
      { status: result.inserted ? 201 : 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("payload_too_large")) {
      return Response.json({ error: "Dados enviados acima do limite permitido." }, { status: 413 });
    }
    if (message.includes("rate_limit_exceeded")) {
      return Response.json(
        { error: "Muitas tentativas de cadastro. Tente novamente mais tarde." },
        { status: 429 },
      );
    }
    return Response.json({ error: "Não foi possível concluir o cadastro agora. Tente novamente." }, { status: 500 });
  }
}
