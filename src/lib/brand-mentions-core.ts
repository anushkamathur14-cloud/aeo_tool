/** Shared brand-mention matching without pulling in the full demo dataset. */

export function textMentionsBrand(text: string, brand: string) {
  const trimmed = brand.trim();
  if (!trimmed) return false;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, "i");
  return pattern.test(text);
}
