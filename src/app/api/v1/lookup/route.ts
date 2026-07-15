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

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = requestSchema.parse(body);
    const brand = input.brand.trim();
    const prompts = generateLookupPrompts(input);
    const category = prompts[0]?.category ?? input.category;
    const peers = prompts[0]?.peers ?? [];
    const keys = input.keys as ProviderKeys;
    const results: LookupEngineResult[] = [];

    for (const prompt of prompts) {
      for (const engine of ENGINES) {
        const providerId = keys[engine.provider] ? engine.provider : ("mock" as ProviderId);
        if (providerId === "mock") {
          results.push(mockResult(engine, prompt.text, brand, category, peers));
          continue;
        }

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
          const mentionedNames = [
            ...completion.mentions.map((mention) => mention.company),
            ...peers.filter((peer) => completion.text.toLowerCase().includes(peer.toLowerCase())),
          ].filter(
            (value, index, list) =>
              list.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index,
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
            mentionedNames: mentionedNames.length
              ? mentionedNames
              : brand
                ? [brand, ...peers].slice(0, 4)
                : peers.slice(0, 4),
          });
        } catch {
          results.push(mockResult(engine, prompt.text, brand, category, peers));
        }
      }
    }

    return NextResponse.json({
      mode: Object.values(keys).some(Boolean) ? "hybrid" : "demo",
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
    examples: [
      { brand: "Pedigree", category: "dog food" },
      { brand: "Chewy", category: "pets" },
      { category: "dogs" },
      { category: "pets" },
    ],
  });
}
