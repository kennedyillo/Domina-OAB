const FOUNDER_LIMIT = 25;

async function getDatabase() {
  const { env } = await import("cloudflare:workers");
  return env.DB;
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

async function founderCount() {
  const database = await getDatabase();
  const row = await database.prepare(
    "SELECT COUNT(*) AS total FROM pilot_leads WHERE status = 'founder'",
  ).first<{ total: number }>();
  return Number(row?.total ?? 0);
}

export async function GET() {
  try {
    const claimed = await founderCount();
    return Response.json({ remaining: Math.max(0, FOUNDER_LIMIT - claimed), limit: FOUNDER_LIMIT });
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

    const database = await getDatabase();
    const inserted = await database.prepare(
      `INSERT INTO pilot_leads (email, status, consent_version)
       SELECT ?, 'founder', '2026-08'
       WHERE (SELECT COUNT(*) FROM pilot_leads WHERE status = 'founder') < ?
       ON CONFLICT(email) DO NOTHING
       RETURNING status`,
    ).bind(email, FOUNDER_LIMIT).first<{ status: "founder" }>();

    const existing = inserted ?? await database.prepare(
      "SELECT status FROM pilot_leads WHERE email = ?",
    ).bind(email).first<{ status: "founder" }>();

    const claimed = await founderCount();
    if (!existing) {
      return Response.json({ error:"As vagas gratuitas foram preenchidas.", closed:true, remaining:0 }, { status:409 });
    }
    return Response.json({
      status: existing.status,
      remaining: Math.max(0, FOUNDER_LIMIT - claimed),
    }, { status: inserted ? 201 : 200 });
  } catch {
    return Response.json({ error: "Não foi possível concluir o cadastro agora. Tente novamente." }, { status: 500 });
  }
}
