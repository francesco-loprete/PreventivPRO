import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthNextPath } from "@/lib/auth/recover-session-from-url";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

function loginErrorRedirect(origin: string) {
  return NextResponse.redirect(new URL("/login?error=auth_callback", origin));
}

/**
 * Quando Supabase usa il flusso implicito i token arrivano nell'hash (#access_token=…),
 * che il server non vede. Restituiamo HTML che inoltra hash + query a /auth/confirm.
 */
function confirmFallbackResponse(confirmPath: string) {
  const html = `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"><title>Conferma accesso</title><script>location.replace(${JSON.stringify(confirmPath)}+location.hash)</script></head><body></body></html>`;
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = resolveAuthNextPath(searchParams, type);

  if (!code && !tokenHash) {
    const confirmPath = `/auth/confirm?next=${encodeURIComponent(next)}`;
    return confirmFallbackResponse(confirmPath);
  }

  const redirectUrl = new URL(next, origin);
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (!error) {
      return response;
    }
  }

  return loginErrorRedirect(origin);
}
