"use client";

import { useEffect } from "react";
import { sanitizeInternalRedirectPath } from "@/lib/auth/safe-redirect";

function shouldHandleRecoveryLink(pathname: string, hash: string): boolean {
  if (!hash || hash.length <= 1) return false;
  if (!hash.includes("access_token") && !hash.includes("type=recovery")) {
    return false;
  }

  // Pagine che gestiscono già hash/token in locale.
  if (pathname === "/auth/confirm" || pathname === "/reset-password") {
    return false;
  }

  return true;
}

export function RecoveryLinkHandler() {
  useEffect(() => {
    const { pathname, hash, search } = window.location;
    if (!shouldHandleRecoveryLink(pathname, hash)) return;

    const params = new URLSearchParams(search);
    const next = sanitizeInternalRedirectPath(
      params.get("next"),
      "/reset-password"
    );
    const confirmUrl = `/auth/confirm?next=${encodeURIComponent(next)}${hash}`;

    window.location.replace(confirmUrl);
  }, []);

  return null;
}
