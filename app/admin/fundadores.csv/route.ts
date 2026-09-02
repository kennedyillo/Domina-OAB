import { getAdminUser } from "@/lib/admin-access";

function csv(value: unknown) {
  return `"${String(value??"").replaceAll('"','""')}"`;
}

export async function GET() {
  const user = await getAdminUser();
  if (!user) return Response.json({error:"Acesso negado."},{status:403});

  const { env } = await import("cloudflare:workers");
  const rows = await env.DB.prepare("SELECT email,status,created_at FROM pilot_leads ORDER BY created_at ASC,id ASC").all<{email:string;status:string;created_at:string}>();
  const lines = ["email,situacao,cadastrado_em",...rows.results.map(row=>[csv(row.email),csv(row.status),csv(row.created_at)].join(","))];
  return new Response(`\uFEFF${lines.join("\n")}`,{headers:{"content-type":"text/csv; charset=utf-8","content-disposition":"attachment; filename=domina-oab-fundadores.csv","cache-control":"no-store"}});
}
