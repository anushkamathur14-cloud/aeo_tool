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
