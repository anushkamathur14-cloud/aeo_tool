export type ProviderId = "openai" | "anthropic" | "google" | "xai" | "perplexity" | "mock";

export type PromptInput = {
  prompt: string;
  company: string;
  competitors: string[];
  category?: string;
  engineLabel?: string;
};

export type ProviderResult = {
  provider: ProviderId;
  model: string;
  text: string;
  latencyMs: number;
  sources: { title: string; url: string }[];
  mentions: { company: string; order: number; sentiment: number }[];
  recommendationStrength: number;
  confidence: number;
  answerLength: number;
};

export type ProviderKeys = Partial<Record<Exclude<ProviderId, "mock">, string>>;

export interface AIProvider {
  id: ProviderId;
  name: string;
  isConfigured(keys: ProviderKeys): boolean;
  complete(input: PromptInput, keys: ProviderKeys): Promise<ProviderResult>;
}

const companyMentions = (text: string, input: PromptInput) =>
  [input.company, ...input.competitors]
    .map((company) => ({ company, index: text.toLowerCase().indexOf(company.toLowerCase()) }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index)
    .map((item, index) => ({ company: item.company, order: index + 1, sentiment: 0.76 }));

const normalize = (
  provider: ProviderId,
  model: string,
  text: string,
  latencyMs: number,
  input: PromptInput,
  sources: { title: string; url: string }[] = [],
): ProviderResult => ({
  provider,
  model,
  text,
  latencyMs,
  sources,
  mentions: companyMentions(text, input),
  recommendationStrength: text.toLowerCase().includes("recommend") ? 0.84 : 0.66,
  confidence: 0.86,
  answerLength: text.split(/\s+/).length,
});

class MockProvider implements AIProvider {
  id = "mock" as const;
  name = "BrandSignal Demo";
  isConfigured() {
    return true;
  }
  async complete(input: PromptInput) {
    const started = performance.now();
    // Lazy import keeps provider module free of circular init issues with domain helpers.
    const { buildMockLookupAnswer } = await import("../domain/lookup");
    const mock = buildMockLookupAnswer({
      prompt: input.prompt,
      brand: input.company,
      category: input.category ?? "consumer brands",
      peers: input.competitors,
      engine: input.engineLabel ?? "ChatGPT",
    });
    return normalize(
      "mock",
      "brandsignal-demo-v1",
      mock.text,
      Math.round(performance.now() - started) + 220 + (hashQuick(input.prompt) % 180),
      input,
      mock.sources,
    );
  }
}

function hashQuick(value: string) {
  let total = 0;
  for (let index = 0; index < value.length; index += 1) total = (total * 31 + value.charCodeAt(index)) >>> 0;
  return total;
}

function extractProviderError(status: number, body: string, providerName: string) {
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string; status?: string; code?: number };
      message?: string;
    };
    const message = parsed.error?.message ?? parsed.message;
    if (message) return `${providerName} request failed (${status}): ${message}`;
  } catch {
    // ignore non-JSON bodies
  }
  const clipped = body.trim().slice(0, 240);
  return clipped
    ? `${providerName} request failed (${status}): ${clipped}`
    : `${providerName} request failed (${status})`;
}

type RemoteConfig = {
  id: Exclude<ProviderId, "mock">;
  name: string;
  model: string;
  endpoint: string;
  headers: (key: string) => HeadersInit;
  body: (model: string, prompt: string) => unknown;
  read: (payload: unknown) => string;
};

class RemoteProvider implements AIProvider {
  id: RemoteConfig["id"];
  name: string;
  constructor(private config: RemoteConfig) {
    this.id = config.id;
    this.name = config.name;
  }
  isConfigured(keys: ProviderKeys) {
    return Boolean(keys[this.id]?.trim());
  }
  async complete(input: PromptInput, keys: ProviderKeys) {
    const key = keys[this.id]?.trim();
    if (!key) throw new Error(`${this.name} API key is not configured`);
    const started = performance.now();
    const response = await fetch(this.config.endpoint, {
      method: "POST",
      headers: this.config.headers(key),
      body: JSON.stringify(this.config.body(this.config.model, input.prompt)),
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(extractProviderError(response.status, body, this.name));
    }
    const payload: unknown = await response.json();
    const text = this.config.read(payload);
    if (!text.trim()) throw new Error(`${this.name} returned an empty answer`);
    return normalize(this.id, this.config.model, text, Math.round(performance.now() - started), input);
  }
}

/** Stable Gemini model cascade — first available wins. */
export const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-1.5-flash",
] as const;

class GoogleGeminiProvider implements AIProvider {
  id = "google" as const;
  name = "Gemini";

  isConfigured(keys: ProviderKeys) {
    return Boolean(keys.google?.trim());
  }

  async complete(input: PromptInput, keys: ProviderKeys) {
    const key = keys.google?.trim();
    if (!key) throw new Error("Gemini API key is not configured");
    if (!/^AIza[0-9A-Za-z_-]{10,}/.test(key)) {
      throw new Error(
        "Gemini key looks invalid. Paste a Google AI Studio key that starts with AIza…",
      );
    }

    const started = performance.now();
    let lastError = "Gemini request failed";

    for (const model of GEMINI_MODELS) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: input.prompt }] }],
        }),
        signal: AbortSignal.timeout(45_000),
      });

      if (!response.ok) {
        const body = await response.text();
        lastError = extractProviderError(response.status, body, "Gemini");
        // Try next model when this one is missing / not supported for the key.
        if (
          response.status === 404 ||
          /not found|is not found|not supported|UNKNOWN_MODEL/i.test(lastError)
        ) {
          continue;
        }
        throw new Error(annotateGeminiError(lastError));
      }

      const payload: unknown = await response.json();
      const text = textAt(payload, ["candidates", 0, "content", "parts", 0, "text"]);
      if (!text.trim()) {
        const blockReason = String(
          valueAt(payload, ["promptFeedback", "blockReason"]) ??
            valueAt(payload, ["candidates", 0, "finishReason"]) ??
            "",
        );
        throw new Error(
          blockReason
            ? `Gemini returned no text (finish/block: ${blockReason})`
            : "Gemini returned an empty answer",
        );
      }
      return normalize("google", model, text, Math.round(performance.now() - started), input);
    }

    throw new Error(annotateGeminiError(lastError));
  }
}

function annotateGeminiError(message: string) {
  if (/API_KEY_HTTP_REFERRER_BLOCKED|referer|referrer/i.test(message)) {
    return `${message} — In Google AI Studio, set Application restrictions to None (server-side BrandSignal calls have no browser referrer).`;
  }
  if (/API_KEY_INVALID|API key not valid|PERMISSION_DENIED|API_KEY_SERVICE_BLOCKED/i.test(message)) {
    return `${message} — Create a new key in Google AI Studio (aistudio.google.com/apikey) with Generative Language API access, restrictions = None.`;
  }
  if (/quota|RESOURCE_EXHAUSTED|rate/i.test(message)) {
    return `${message} — Gemini quota may be exhausted for this project.`;
  }
  return message;
}

/** Lightweight key probe used by Settings → Test. */
export async function verifyGeminiKey(apiKey: string) {
  const key = apiKey.trim();
  if (!key) return { ok: false as const, error: "Paste a Gemini API key first." };
  try {
    const provider = new GoogleGeminiProvider();
    const result = await provider.complete(
      {
        prompt: "Reply with exactly: ok",
        company: "BrandSignal",
        competitors: [],
      },
      { google: key },
    );
    return {
      ok: true as const,
      model: result.model,
      latencyMs: result.latencyMs,
      preview: result.text.slice(0, 80),
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Gemini verification failed",
    };
  }
}

const valueAt = (value: unknown, path: (string | number)[]): unknown =>
  path.reduce<unknown>((current, key) => {
    if (typeof key === "number" && Array.isArray(current)) return current[key];
    if (typeof key === "string" && current && typeof current === "object")
      return (current as Record<string, unknown>)[key];
    return undefined;
  }, value);

const textAt = (payload: unknown, path: (string | number)[]) => String(valueAt(payload, path) ?? "");

export const providers: AIProvider[] = [
  new RemoteProvider({
    id: "openai",
    name: "ChatGPT",
    model: "gpt-4.1-mini",
    endpoint: "https://api.openai.com/v1/chat/completions",
    headers: (key) => ({ "Content-Type": "application/json", Authorization: `Bearer ${key}` }),
    body: (model, prompt) => ({ model, messages: [{ role: "user", content: prompt }] }),
    read: (payload) => textAt(payload, ["choices", 0, "message", "content"]),
  }),
  new RemoteProvider({
    id: "anthropic",
    name: "Claude",
    model: "claude-3-5-haiku-latest",
    endpoint: "https://api.anthropic.com/v1/messages",
    headers: (key) => ({
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    }),
    body: (model, prompt) => ({ model, max_tokens: 900, messages: [{ role: "user", content: prompt }] }),
    read: (payload) => textAt(payload, ["content", 0, "text"]),
  }),
  new GoogleGeminiProvider(),
  new RemoteProvider({
    id: "xai",
    name: "Grok",
    model: "grok-3-mini",
    endpoint: "https://api.x.ai/v1/chat/completions",
    headers: (key) => ({ "Content-Type": "application/json", Authorization: `Bearer ${key}` }),
    body: (model, prompt) => ({ model, messages: [{ role: "user", content: prompt }] }),
    read: (payload) => textAt(payload, ["choices", 0, "message", "content"]),
  }),
  new RemoteProvider({
    id: "perplexity",
    name: "Perplexity",
    model: "sonar",
    endpoint: "https://api.perplexity.ai/chat/completions",
    headers: (key) => ({ "Content-Type": "application/json", Authorization: `Bearer ${key}` }),
    body: (model, prompt) => ({ model, messages: [{ role: "user", content: prompt }] }),
    read: (payload) => textAt(payload, ["choices", 0, "message", "content"]),
  }),
  new MockProvider(),
];

export function getProvider(id: ProviderId) {
  const provider = providers.find((item) => item.id === id);
  if (!provider) throw new Error(`Unknown provider: ${id}`);
  return provider;
}
