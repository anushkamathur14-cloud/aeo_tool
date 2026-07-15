import { z } from "zod";

export const scanInputSchema = z.object({
  company: z.string().min(2).max(80),
  website: z.string().url(),
  industry: z.string().min(2),
  country: z.string().min(2),
  competitors: z.array(z.string().min(2)).min(1).max(8),
  products: z.array(z.string().min(2)).min(1).max(10),
  audience: z.string().min(3).max(180),
});

export type ScanInput = z.infer<typeof scanInputSchema>;
export type JourneyStage =
  | "awareness"
  | "discovery"
  | "research"
  | "comparison"
  | "purchase"
  | "support";

export type GeneratedPrompt = { text: string; stage: JourneyStage };

const templates: Record<JourneyStage, string[]> = {
  awareness: [
    "What tools help {audience} improve {industry}?",
    "What are the biggest challenges in {industry} this year?",
    "How should {audience} evaluate modern {industry} software?",
    "Which trends are changing {industry}?",
  ],
  discovery: [
    "What is the best {industry} software for {audience}?",
    "Recommend easy-to-use {industry} platforms in {country}.",
    "Which {industry} products have the fastest time to value?",
    "What are the top-rated alternatives in {industry}?",
  ],
  research: [
    "Is {company} a good choice for {audience}?",
    "What are the strengths and limitations of {company}?",
    "How does {company} handle onboarding and integrations?",
    "What do customers say about {company}?",
  ],
  comparison: [
    "{company} vs {competitor}: which is better for {audience}?",
    "What are the best alternatives to {competitor}?",
    "Compare {company}, {competitor}, and other {industry} leaders.",
    "Which is easier to implement: {company} or {competitor}?",
  ],
  purchase: [
    "Should I buy {company} for a growing team?",
    "Which {industry} platform offers the best value?",
    "What should I know before choosing {company}?",
    "Recommend a {industry} vendor for {audience}.",
  ],
  support: [
    "How do I get started with {company}?",
    "What integrations does {company} support?",
    "How can I migrate from {competitor} to {company}?",
    "Does {company} work well for {audience}?",
  ],
};

export function generatePrompts(input: ScanInput, limit = 24): GeneratedPrompt[] {
  const stages = Object.keys(templates) as JourneyStage[];
  const generated: GeneratedPrompt[] = [];
  let variation = 0;

  while (generated.length < limit) {
    for (const stage of stages) {
      if (generated.length >= limit) break;
      const items = templates[stage];
      const template = items[variation % items.length];
      const competitor = input.competitors[variation % input.competitors.length];
      const text = template
        .replaceAll("{company}", input.company)
        .replaceAll("{competitor}", competitor)
        .replaceAll("{industry}", input.industry)
        .replaceAll("{country}", input.country)
        .replaceAll("{audience}", input.audience);
      generated.push({ stage, text });
    }
    variation += 1;
  }

  return generated;
}
