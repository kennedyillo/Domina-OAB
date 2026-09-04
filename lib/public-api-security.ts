import { supabaseAdminRpc } from "@/lib/supabase";

type RateResult = { allowed?: boolean; retry_after_seconds?: number; hits?: number };

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number,
) {
  const userAgent = request.headers.get("user-agent")?.slice(0, 160) || "unknown";
  const key = `${clientIp(request)}|${userAgent}`;
  const result = await supabaseAdminRpc<RateResult>("consume_public_api_rate_limit", {
    p_scope: scope,
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (result.allowed === false) {
    const retry = Math.max(1, Math.min(windowSeconds, Number(result.retry_after_seconds) || windowSeconds));
    return Response.json(
      { error: "Muitas solicitações em pouco tempo." },
      { status: 429, headers: { "Retry-After": String(retry) } },
    );
  }
  return null;
}

export async function readJsonWithLimit<T>(request: Request, maxBytes: number): Promise<T> {
  const text = await request.text();
  const bytes = new TextEncoder().encode(text).byteLength;
  if (bytes > maxBytes) throw new Error("payload_too_large");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("invalid_json");
  }
}
