"use client";

import { useEffect } from "react";

const AUTH_PATH_PREFIXES = ["/auth/", "/login", "/registrazione", "/reset-password"];

function shouldHandleRecoveryLink(pathname: string, hash: string): boolean {
  if (!hash || hash.length <= 1) return false;
  if (!hash.includes("access_token") && !hash.includes("type=recovery")) {
    return false;
  }

  return !AUTH_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  );
}

export function RecoveryLinkHandler() {
  useEffect(() => {
    const { pathname, hash, search } = window.location;
    if (!shouldHandleRecoveryLink(pathname, hash)) return;

    const params = new URLSearchParams(search);
    const next = params.get("next") ?? "/reset-password";
    const confirmUrl = `/auth/confirm?next=${encodeURIComponent(next)}${hash}`;

    window.location.replace(confirmUrl);
  }, []);

  return null;
}
