import { cookies } from "next/headers";

const ACCESS_COOKIE = "domina_access_token";

function requiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variável ${name} não configurada.`);
  return value.replace(/\/$/, "");
}

function publicHeaders() {
  const key = requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
  };
}

function legacyJwtRole(key: string) {
  const parts = key.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

function adminHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("Chave privilegiada do Supabase não configurada. Defina SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY no servidor.");
  }

  if (key.startsWith("sb_publishable_")) {
    throw new Error("Chave Supabase inválida no backend: foi configurada uma chave publicável no lugar da chave secreta.");
  }

  const headers: Record<string, string> = {
    apikey: key,
    "content-type": "application/json",
  };

  if (key.startsWith("sb_secret_")) return headers;

  const role = legacyJwtRole(key);
  if (role !== "service_role") {
    throw new Error(`Chave Supabase privilegiada inválida no backend${role ? `: role ${role}` : ": formato desconhecido"}.`);
  }

  headers.authorization = `Bearer ${key}`;
  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  }
  const detail = await response.text();
  throw new Error(`Supabase respondeu ${response.status}: ${detail.slice(0, 600)}`);
}

export async function supabasePublicRpc<T>(fn: string, body: Record<string, unknown>) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  return parseResponse<T>(await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  }));
}

export async function supabaseAdminRpc<T>(fn: string, body: Record<string, unknown> = {}) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  return parseResponse<T>(await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  }));
}

export async function supabaseAdminSelect<T>(path: string) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  return parseResponse<T>(await fetch(`${url}/rest/v1/${path}`, {
    headers: adminHeaders(),
    cache: "no-store",
  }));
}

export async function supabaseAdminInsert(table: string, body: Record<string, unknown>) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      ...adminHeaders(),
      prefer: "return=minimal",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase respondeu ${response.status}: ${detail.slice(0, 600)}`);
  }
}

export async function supabaseAdminUpdate<T>(path: string, body: Record<string, unknown>) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  return parseResponse<T>(await fetch(`${url}/rest/v1/${path}`, {
    method: "PATCH",
    headers: {
      ...adminHeaders(),
      prefer: "return=representation",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  }));
}

export async function signInWithPassword(email: string, password: string) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  return parseResponse<{
    access_token: string;
    expires_in: number;
    user: {
      id: string;
      email?: string;
      app_metadata?: Record<string, unknown>;
      user_metadata?: Record<string, unknown>;
    };
  }>(await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  }));
}

export async function signUpWithPassword(email: string, password: string, fullName?: string) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  return parseResponse<{
    access_token?: string;
    expires_in?: number;
    user: { id: string; email?: string; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> };
  }>(await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password, data: fullName ? { full_name: fullName } : undefined }),
    cache: "no-store",
  }));
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const response = await fetch(`${url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    headers: {
      apikey: requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      "content-type": "application/json",
    },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase respondeu ${response.status}: ${detail.slice(0, 600)}`);
  }
}

export async function verifyRecoveryTokenHash(tokenHash: string) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  return parseResponse<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    user?: { id: string; email?: string };
  }>(await fetch(`${url}/auth/v1/verify`, {
    method: "POST",
    headers: {
      apikey: requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      "content-type": "application/json",
    },
    body: JSON.stringify({ token_hash: tokenHash, type: "recovery" }),
    cache: "no-store",
  }));
}

export async function updatePasswordWithAccessToken(accessToken: string, password: string) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const response = await fetch(`${url}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ password }),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase respondeu ${response.status}: ${detail.slice(0, 600)}`);
  }
}

export async function resolveLoginIdentifier(identifier: string) {
  return supabaseAdminRpc<string | null>("resolve_login_identifier", { p_identifier: identifier });
}

export async function getSupabaseUser() {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return await response.json() as {
    id: string;
    email?: string;
    phone?: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
  };
}

export const supabaseAccessCookie = ACCESS_COOKIE;
