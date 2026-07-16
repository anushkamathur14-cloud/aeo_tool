import { NextResponse } from "next/server";
import { z } from "zod";
import { runLookupAgentPipeline } from "@/lib/agents/orchestrator";
import { onDemandLookupSchema } from "@/lib/domain/lookup";
import type { ProviderKeys } from "@/lib/providers";

export const runtime = "nodejs";

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

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = requestSchema.parse(body);
    const result = await runLookupAgentPipeline({
      input: {
        brand: input.brand,
        category: input.category,
        country: input.country,
        promptLimit: input.promptLimit,
        mode: input.mode,
      },
      keys: input.keys as ProviderKeys,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: result.status },
      );
    }

    const { ok: _ok, ...payload } = result;
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid lookup request", issues: error.issues }, { status: 400 });
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "BrandSignal agentic lookup",
    agents: [
      "query (send prompts + cost ledger)",
      "evaluation (mention/rank scoring)",
      "classification (intent/journey/sentiment)",
      "faq (explain results)",
    ],
    modes: ["live", "demo"],
    examples: [
      { brand: "Chewy", category: "pets", mode: "live" },
      { brand: "Streamora", category: "OTT streaming", mode: "demo" },
      { category: "best OTT platform", mode: "demo" },
    ],
  });
}
