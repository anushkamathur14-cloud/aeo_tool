import { NextResponse } from "next/server";
import { z } from "zod";
import { answerLookupChat, type LookupChatContext } from "@/lib/agents/chat-agent";

export const runtime = "nodejs";

const contextSchema = z.object({
  brand: z.string(),
  category: z.string(),
  mode: z.enum(["live", "demo"]),
  mentionCount: z.number(),
  totalAnswers: z.number(),
  mentionRate: z.number(),
  avgPosition: z.number().nullable(),
  shareOfVoice: z.array(
    z.object({
      name: z.string(),
      share: z.number(),
      count: z.number().optional(),
    }),
  ),
  byEngine: z.array(
    z.object({
      engineName: z.string(),
      mentions: z.number(),
      answers: z.number(),
      mentionRate: z.number(),
      avgPosition: z.number().nullable(),
    }),
  ),
  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
  appearances: z
    .array(
      z.object({
        kind: z.enum(["mentioned", "missed"]),
        prompt: z.string(),
        engineName: z.string(),
        position: z.number().nullable(),
        snippet: z.string(),
        peers: z.array(z.string()),
      }),
    )
    .optional(),
  evidenceMap: z
    .object({
      fanouts: z.number(),
      evidenceShare: z.number(),
      navigationalShare: z.number(),
      brandInNavigationalQueries: z.number(),
      brandWinsNavigational: z.number(),
      insight: z.string(),
    })
    .optional(),
  results: z
    .array(
      z.object({
        prompt: z.string(),
        engineName: z.string(),
        brandMentioned: z.boolean(),
        brandPosition: z.number().nullable(),
        text: z.string(),
        mentionedNames: z.array(z.string()),
      }),
    )
    .optional(),
  intentCounts: z.record(z.string(), z.number()).optional(),
});

const requestSchema = z.object({
  question: z.string().trim().min(2).max(500),
  context: contextSchema,
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = requestSchema.parse(body);
    const result = answerLookupChat(input.question, input.context as LookupChatContext);
    return NextResponse.json({
      question: input.question,
      ...result,
      agent: "lookup-chat",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid chat request", issues: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "BrandSignal lookup chat agent",
    description: "Ask follow-up questions grounded in a completed brand/category lookup run.",
    exampleQuestions: [
      "How often does Peacock show up?",
      "Which engine is weakest?",
      "Where is the brand missing?",
      "Who leads share of voice?",
    ],
  });
}
