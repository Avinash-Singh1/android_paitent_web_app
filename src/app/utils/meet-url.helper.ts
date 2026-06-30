/**
 * meet-url.helper.ts
 *
 * Reusable utility for constructing Google Meet URLs with an `authuser` query
 * parameter so the correct Google account is pre-selected in the join flow.
 */

/**
 * Builds a Google Meet URL pre-authorised for `email`.
 *
 * Rules:
 * - Returns `meetUrl` unchanged if it is null/empty/undefined.
 * - Returns `meetUrl` unchanged if `email` is null/empty/undefined.
 * - Returns `meetUrl` unchanged if it already contains `authuser=` (avoids duplicates).
 * - Appends `?authuser=<encoded-email>` when `meetUrl` has no existing query string.
 * - Appends `&authuser=<encoded-email>` when `meetUrl` already has query params.
 *
 * @example
 * buildMeetUrl('https://meet.google.com/abc-defg-hij', 'doc@gmail.com')
 * // → 'https://meet.google.com/abc-defg-hij?authuser=doc%40gmail.com'
 */
export function buildMeetUrl(
  meetUrl: string | null | undefined,
  email: string | null | undefined
): string {
  // Guard: if Meet URL is absent, return empty string.
  if (!meetUrl || !meetUrl.trim()) return '';

  // Guard: if no email, return URL as-is (graceful degradation).
  if (!email || !email.trim()) return meetUrl;

  // Guard: do not append authuser if it is already present.
  if (meetUrl.includes('authuser=')) return meetUrl;

  const encodedEmail = encodeURIComponent(email.trim());
  const separator = meetUrl.includes('?') ? '&' : '?';
  return `${meetUrl}${separator}authuser=${encodedEmail}`;
}
