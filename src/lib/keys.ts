export const STORAGE_PREFIX = "brandsignal.settings.";

export type StoredProviderId = "openai" | "anthropic" | "google" | "xai" | "perplexity";

export const ENGINE_TO_PROVIDER: Record<string, StoredProviderId | "mock"> = {
  chatgpt: "openai",
  claude: "anthropic",
  gemini: "google",
  perplexity: "perplexity",
  grok: "xai",
  copilot: "mock",
};

export function readProviderKeys(): Partial<Record<StoredProviderId, string>> {
  if (typeof window === "undefined") return {};
  const keys: Partial<Record<StoredProviderId, string>> = {};
  for (const id of ["openai", "anthropic", "google", "xai", "perplexity"] as const) {
    const value = localStorage.getItem(STORAGE_PREFIX + id)?.trim();
    if (value) keys[id] = value;
  }
  return keys;
}

export type LastLookup = {
  brand: string;
  category: string;
  mode: "live" | "demo";
  at: string;
};

const LAST_LOOKUP_KEY = `${STORAGE_PREFIX}lastLookup`;

export function saveLastLookup(lookup: Omit<LastLookup, "at">) {
  if (typeof window === "undefined") return;
  const payload: LastLookup = { ...lookup, at: new Date().toISOString() };
  localStorage.setItem(LAST_LOOKUP_KEY, JSON.stringify(payload));
}

export function readLastLookup(): LastLookup | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_LOOKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastLookup;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      brand: String(parsed.brand ?? "").trim(),
      category: String(parsed.category ?? "").trim(),
      mode: parsed.mode === "live" ? "live" : "demo",
      at: String(parsed.at ?? ""),
    };
  } catch {
    return null;
  }
}
