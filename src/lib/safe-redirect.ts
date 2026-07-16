/** Caminho interno seguro para redirects pós-login (bloqueia open redirect). */
export function safeNextPath(next: string | null | undefined, fallback = "/portal"): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return fallback;
}
