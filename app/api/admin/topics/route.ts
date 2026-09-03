import { getAdminUser } from "@/lib/admin-access";
import { supabaseAdminSelect } from "@/lib/supabase";

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Acesso negado." }, { status: 403 });

  const url = new URL(request.url);
  const disciplineSlug = url.searchParams.get("discipline_slug")?.trim() || "etica-profissional";

  try {
    const disciplines = await supabaseAdminSelect<{ id: number }[]>(
      `disciplines?slug=eq.${encodeURIComponent(disciplineSlug)}&select=id&limit=1`
    );
    const disciplineId = disciplines[0]?.id;
    if (!disciplineId) return Response.json({ topics: [] });

    const topics = await supabaseAdminSelect<{ id: number; slug: string; name: string }[]>(
      `question_topics?discipline_id=eq.${disciplineId}&active=eq.true&select=id,slug,name&order=position.asc`
    );

    return Response.json({ topics });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Não foi possível carregar os temas." },
      { status: 500 }
    );
  }
}

