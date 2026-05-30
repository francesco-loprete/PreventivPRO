export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesText(haystack: string | null | undefined, query: string): boolean {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return true;
  return (haystack ?? "").toLowerCase().includes(normalized);
}

export function matchesAnyField(
  fields: Array<string | null | undefined>,
  query: string
): boolean {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return true;
  return fields.some((field) => (field ?? "").toLowerCase().includes(normalized));
}
