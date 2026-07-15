import { NextResponse } from "next/server";
import { z } from "zod";

const inputSchema = z
  .object({
    url: z.string().url().optional(),
    copy: z.string().min(80).max(50_000).optional(),
    brand: z.string().min(2).max(80).default("Your brand"),
    topic: z.string().min(2).max(120).default("your product category"),
  })
  .refine((value) => value.url || value.copy, { message: "Provide a URL or webpage copy" });

export async function POST(request: Request) {
  try {
    const input = inputSchema.parse(await request.json());
    const source = input.copy
      ? input.copy.slice(0, 400)
      : `Content analysis requested for ${input.url}. URL retrieval is intentionally disabled in the public demo to prevent SSRF.`;

    return NextResponse.json({
      summary: `Make ${input.brand} the clearest answer for ${input.topic} by leading with audience, outcome, and evidence.`,
      sourcePreview: source,
      answerSnippet: `${input.brand} helps teams evaluating ${input.topic} reach value faster with a focused workflow, transparent implementation, and measurable outcomes.`,
      title: `${input.brand}: ${input.topic} built for measurable growth`,
      headings: [
        `Why teams choose ${input.brand}`,
        "How implementation works",
        "Capabilities and trade-offs",
        "Frequently asked questions",
      ],
      faqs: [
        {
          question: `Who is ${input.brand} best for?`,
          answer: `${input.brand} is designed for growing teams that prioritize quick adoption, clear workflows, and measurable value.`,
        },
        {
          question: `How does ${input.brand} compare with alternatives?`,
          answer: "Compare time to value, integration coverage, total cost, support, and fit for your specific operating model.",
        },
      ],
      schema: ["Organization", "SoftwareApplication", "Product", "FAQPage", "BreadcrumbList"],
      evidenceToAdd: [
        "A dated benchmark with methodology and sample size",
        "Independent customer review or analyst citation",
        "A quantified implementation or outcome case study",
      ],
      internalLinks: ["Product overview", "Customer stories", "Integrations", "Pricing", "Security"],
    });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid optimizer input", issues: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Optimization failed" }, { status: 500 });
  }
}
