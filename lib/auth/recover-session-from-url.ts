import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";

export type RecoverSessionResult =
  | { status: "recovered" }
  | { status: "none" }
  | { status: "error"; message: string };

export function hasAuthParamsInUrl(
  search = typeof window !== "undefined" ? window.location.search : "",
  hash = typeof window !== "undefined" ? window.location.hash : ""
): boolean {
  const searchParams = new URLSearchParams(search);
  if (searchParams.get("code") || searchParams.get("token_hash")) {
    return true;
  }

  return hash.includes("access_token") || hash.includes("type=recovery");
}

export function clearAuthParamsFromUrl() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.hash = "";

  for (const key of ["code", "token_hash", "type"]) {
    url.searchParams.delete(key);
  }

  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

export async function recoverSessionFromUrl(
  supabase: SupabaseClient,
  options?: { search?: string; hash?: string }
): Promise<RecoverSessionResult> {
  const search =
    options?.search ??
    (typeof window !== "undefined" ? window.location.search : "");
  const hash =
    options?.hash ??
    (typeof window !== "undefined" ? window.location.hash : "");

  const searchParams = new URLSearchParams(search);

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return { status: "error", message: error.message };
    }
    return { status: "recovered" };
  }

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (error) {
      return { status: "error", message: error.message };
    }
    return { status: "recovered" };
  }

  if (hash.length > 1) {
    const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        return { status: "error", message: error.message };
      }
      return { status: "recovered" };
    }
  }

  return { status: "none" };
}

export function resolveAuthNextPath(
  searchParams: URLSearchParams,
  type: string | null
): string {
  const next = searchParams.get("next") ?? searchParams.get("redirectTo");
  if (next) {
    return next.startsWith("/") ? next : `/${next}`;
  }

  if (type === "recovery") {
    return "/reset-password";
  }

  return "/";
}
