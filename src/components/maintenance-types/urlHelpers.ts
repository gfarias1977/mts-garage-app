export function buildUrl(
  base: URLSearchParams,
  updates: Record<string, string | null>,
): string {
  const params = new URLSearchParams(base.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }
  return `/maintenance-types?${params.toString()}`;
}
