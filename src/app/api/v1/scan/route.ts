import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePrompts, scanInputSchema } from "@/lib/domain/prompts";
import { getProvider, type ProviderId, type ProviderKeys } from "@/lib/providers";

export const runtime = "nodejs";

const requestSchema = scanInputSchema.extend({
  providers: z
    .array(z.enum(["openai", "anthropic", "google", "xai", "perplexity", "mock"]))
    .min(1)
    .max(5)
    .default(["mock"]),
  keys: z
    .object({
      openai: z.string().optional(),
      anthropic: z.string().optional(),
      google: z.string().optional(),
      xai: z.string().optional(),
      perplexity: z.string().optional(),
    })
    .default({}),
  promptLimit: z.number().int().min(1).max(24).default(6),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = requestSchema.parse(body);
    const prompts = generatePrompts(input, input.promptLimit);
    const keys = input.keys as ProviderKeys;

    // Demo-safe cap: callers can never trigger more than 24 prompts or 5 engines.
    const results = await Promise.all(
      prompts.flatMap((prompt) =>
        input.providers.map(async (providerId) => {
          const requested = getProvider(providerId as ProviderId);
          const provider = requested.isConfigured(keys) ? requested : getProvider("mock");
          const result = await provider.complete(
            { prompt: prompt.text, company: input.company, competitors: input.competitors },
            keys,
          );
          return { prompt, requestedProvider: providerId, ...result };
        }),
      ),
    );

    return NextResponse.json({
      mode: input.providers.some((id) => id !== "mock" && keys[id as keyof ProviderKeys])
        ? "hybrid"
        : "demo",
      promptCount: prompts.length,
      results,
    });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid scan configuration", issues: error.issues }, { status: 400 });
    const message = error instanceof Error ? error.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "BrandSignal Scan API",
    version: "v1",
    providers: ["openai", "anthropic", "google", "xai", "perplexity", "mock"],
    maxPromptsPerRequest: 24,
  });
}
