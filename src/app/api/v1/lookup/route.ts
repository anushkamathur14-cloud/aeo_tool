import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildMockLookupAnswer,
  generateLookupPrompts,
  onDemandLookupSchema,
  summarizeLookupResults,
  type LookupEngineResult,
} from "@/lib/domain/lookup";
import { getProvider, type ProviderId, type ProviderKeys } from "@/lib/providers";

export const runtime = "nodejs";

const ENGINES = [
  { id: "chatgpt", provider: "openai" as const, name: "ChatGPT", color: "#34d399" },
  { id: "claude", provider: "anthropic" as const, name: "Claude", color: "#f59e0b" },
  { id: "perplexity", provider: "perplexity" as const, name: "Perplexity", color: "#38bdf8" },
  { id: "gemini", provider: "google" as const, name: "Gemini", color: "#818cf8" },
  { id: "grok", provider: "xai" as const, name: "Grok", color: "#a3a3a3" },
];

const requestSchema = onDemandLookupSchema.extend({
  mode: z.enum(["live", "demo"]).default("live"),
  keys: z
    .object({
      openai: z.string().optional(),
      anthropic: z.string().optional(),
      google: z.string().optional(),
      xai: z.string().optional(),
      perplexity: z.string().optional(),
    })
    .default({}),
});

function mockResult(
  engine: (typeof ENGINES)[number],
  prompt: string,
  brand: string,
  category: string,
  peers: string[],
): LookupEngineResult {
  const mock = buildMockLookupAnswer({
    prompt,
    brand,
    category,
    peers,
    engine: engine.name,
  });
  return {
    engineId: engine.id,
    engineName: engine.name,
    color: engine.color,
    prompt,
    text: mock.text,
    brandMentioned: mock.brandMentioned,
    brandPosition: mock.brandPosition,
    mentionedNames: mock.mentionedNames,
  };
}

function extractMentionedNames(
  text: string,
  brand: string,
  peers: string[],
  completionMentions: Array<{ company: string; order: number }>,
) {
  const fromCompletion = completionMentions.map((mention) => mention.company);
  const fromPeers = peers.filter((peer) => text.toLowerCase().includes(peer.toLowerCase()));
  const fromBrand =
    brand && text.toLowerCase().includes(brand.toLowerCase()) ? [brand] : [];
  return [...fromCompletion, ...fromPeers, ...fromBrand].filter(
    (value, index, list) =>
      list.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index,
  );
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = requestSchema.parse(body);
    const brand = input.brand.trim();
    const keys = input.keys as ProviderKeys;
    const mode = input.mode;
    const configuredEngines = ENGINES.filter((engine) => Boolean(keys[engine.provider]));

    if (mode === "live" && configuredEngines.length === 0) {
      return NextResponse.json(
        {
          error:
            "Live lookup needs at least one API key. Add keys in Settings, or switch to Demo mode.",
          code: "MISSING_API_KEYS",
        },
        { status: 400 },
      );
    }

    // Live lookups stay smaller to control cost; demo can be broader.
    const promptLimit = mode === "live" ? Math.min(input.promptLimit, 4) : input.promptLimit;
    const prompts = generateLookupPrompts({ ...input, promptLimit });
    const category = prompts[0]?.category ?? input.category;
    const peers = prompts[0]?.peers ?? [];
    const engines = mode === "live" ? configuredEngines : ENGINES;
    const results: LookupEngineResult[] = [];
    const liveEngines: string[] = [];
    const failedEngines: string[] = [];

    for (const prompt of prompts) {
      for (const engine of engines) {
        if (mode === "demo") {
          results.push(mockResult(engine, prompt.text, brand, category, peers));
          continue;
        }

        const providerId = engine.provider as ProviderId;
        try {
          const provider = getProvider(providerId);
          const completion = await provider.complete(
            {
              prompt: prompt.text,
              company: brand || peers[0] || category,
              competitors: peers.slice(0, 4),
            },
            keys,
          );
          if (!liveEngines.includes(engine.name)) liveEngines.push(engine.name);

          const mentionedNames = extractMentionedNames(
            completion.text,
            brand,
            peers,
            completion.mentions,
          );
          const brandMentioned = Boolean(
            brand &&
              (completion.mentions.some(
                (mention) => mention.company.toLowerCase() === brand.toLowerCase(),
              ) ||
                completion.text.toLowerCase().includes(brand.toLowerCase())),
          );
          let brandPosition: number | null = null;
          if (brandMentioned) {
            brandPosition =
              completion.mentions.find(
                (mention) => mention.company.toLowerCase() === brand.toLowerCase(),
              )?.order ??
              mentionedNames.findIndex((name) => name.toLowerCase() === brand.toLowerCase()) + 1;
            if (!brandPosition) brandPosition = 1;
          }

          results.push({
            engineId: engine.id,
            engineName: engine.name,
            color: engine.color,
            prompt: prompt.text,
            text: completion.text,
            brandMentioned,
            brandPosition,
            mentionedNames,
          });
        } catch {
          if (!failedEngines.includes(engine.name)) failedEngines.push(engine.name);
          // Live mode: skip failed engines instead of silently substituting demo answers.
        }
      }
    }

    if (mode === "live" && results.length === 0) {
      return NextResponse.json(
        {
          error: `Live lookup failed for ${failedEngines.join(", ") || "configured engines"}. Check API keys and try again.`,
          code: "LIVE_LOOKUP_FAILED",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      mode,
      liveEngines,
      failedEngines,
      ...summarizeLookupResults({ brand, category, results }),
    });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid lookup request", issues: error.issues }, { status: 400 });
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "BrandSignal on-demand lookup",
    modes: ["live", "demo"],
    defaultMode: "live",
    examples: [
      { brand: "Pedigree", category: "dog food", mode: "live" },
      { brand: "Chewy", category: "pets", mode: "demo" },
      { category: "dogs", mode: "live" },
    ],
  });
}
