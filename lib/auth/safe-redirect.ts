/**
 * Accetta solo path interni relativi (es. /preventivi, /clienti/1).
 * Rifiuta URL assoluti, protocol-relative (//) e backslash.
 */
export function sanitizeInternalRedirectPath(
  path: string | null | undefined,
  fallback = "/"
): string {
  if (!path) return fallback;

  const trimmed = path.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes("://")
  ) {
    return fallback;
  }

  try {
    const url = new URL(trimmed, "http://localhost");
    if (url.origin !== "http://localhost") {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
