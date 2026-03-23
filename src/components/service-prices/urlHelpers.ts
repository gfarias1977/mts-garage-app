export function buildUrl(
  base: URLSearchParams,
  serviceId: string,
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
  return `/services/${serviceId}/prices?${params.toString()}`;
}
