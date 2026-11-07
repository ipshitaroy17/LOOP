/**
 * Sanitizes search terms for PostgREST ilike queries by escaping wildcards `%` and `_`.
 */
export function sanitizeSearchQuery(input?: string | null): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[%_]/g, '\\$&') // escape SQL wildcards
    .slice(0, 80); // enforce sensible length limit
}

