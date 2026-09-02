import { supabasePublicRpc } from "@/lib/supabase";

const FOUNDER_LIMIT = 25;

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

type FounderResult = {
  status?: "founder";
  remaining: number;
  closed?: boolean;
  error?: string;
  inserted?: boolean;
};

export async function GET() {
  try {
    const result = await supabasePublicRpc<FounderResult>("founder_availability", {});
    return Response.json({ remaining: result.remaining, limit: FOUNDER_LIMIT });
  } catch {
    return Response.json({ remaining: FOUNDER_LIMIT, limit: FOUNDER_LIMIT });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; consent?: unknown };
    const email = normalizeEmail(body.email);

    if (!validEmail(email)) {
      return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }
    if (body.consent !== true) {
      return Response.json({ error: "É necessário aceitar o envio das comunicações." }, { status: 400 });
    }

    const result = await supabasePublicRpc<FounderResult>("register_founder", {
      p_email: email,
      p_consent_version: "2026-09",
    });

    if (result.closed) {
      return Response.json({ error: result.error ?? "As vagas gratuitas foram preenchidas.", closed:true, remaining:0 }, { status:409 });
    }

    return Response.json({ status: result.status ?? "founder", remaining: result.remaining }, { status: result.inserted ? 201 : 200 });
  } catch {
    return Response.json({ error: "Não foi possível concluir o cadastro agora. Tente novamente." }, { status: 500 });
  }
}
