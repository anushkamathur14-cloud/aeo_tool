import type { EvidenceMap } from "./fanout-agent";
import { createAgentLog } from "./types";

export type FaqItem = {
  question: string;
  answer: string;
  confidence: number;
};

/**
 * FAQ Agent — turns lookup findings into plain-language FAQs for the user.
 */
export function runFaqAgent(args: {
  brand: string;
  category: string;
  mode: "live" | "demo";
  mentionCount: number;
  totalAnswers: number;
  mentionRate: number;
  avgPosition: number | null;
  topBrands: Array<{ name: string; share: number }>;
  totalCostUsd: number;
  liveEngines: string[];
  evidenceMap?: EvidenceMap;
}) {
  const log = createAgentLog();
  log.push("faq", "Generating FAQ explanations from classified results");

  const leader = args.topBrands[0]?.name ?? "category leaders";
  const brand = args.brand || "your brand";
  const faqs: FaqItem[] = [
    {
      question: `How often is ${brand} mentioned for ${args.category}?`,
      answer: args.brand
        ? `${brand} appeared in ${args.mentionCount} of ${args.totalAnswers} answers (${args.mentionRate}% mention rate)${
            args.avgPosition ? `, at an average position of #${args.avgPosition}` : ""
          }.`
        : `This was a category scan for ${args.category}. ${leader} led share of voice across the generated prompts.`,
      confidence: 0.92,
    },
    {
      question: `Who leads share of voice in ${args.category}?`,
      answer: args.topBrands.length
        ? `${args.topBrands
            .slice(0, 3)
            .map((row) => `${row.name} (${row.share}%)`)
            .join(", ")} appear most often in the evaluated answers.`
        : `Not enough brand entities were extracted from ${args.category} answers yet.`,
      confidence: 0.88,
    },
    {
      question: "Was this live AI data or demo data?",
      answer:
        args.mode === "live"
          ? `Live mode used ${args.liveEngines.join(", ") || "configured engines"} with an estimated query cost of $${args.totalCostUsd.toFixed(4)}.`
          : "Demo mode used sample answers only — no provider APIs were called.",
      confidence: 0.97,
    },
  ];

  if (args.evidenceMap) {
    const map = args.evidenceMap;
    faqs.push({
      question: "What fan-outs happen before a recommendation?",
      answer: `Commercial prompts expanded into ${map.fanouts} fan-out queries (~${map.evidenceShare}% informational evidence, ~${map.navigationalShare}% navigational brand-checks). Recommendation — not citation — is the goal; informational pages mainly serve as proof engines use when deciding who to recommend.`,
      confidence: 0.9,
    });
    faqs.push({
      question: args.brand
        ? `Does ${brand} survive navigational brand-checks?`
        : "Do navigational brand-checks matter?",
      answer: args.brand
        ? `${brand} appeared in ${map.brandInNavigationalQueries} navigational fan-out queries and won ${map.brandWinsNavigational} of those brand-checks. ${map.insight}`
        : map.insight,
      confidence: 0.87,
    });
  }

  faqs.push({
    question: `What should I do next to improve AEO visibility for ${brand}?`,
    answer: args.brand
      ? `Prioritize commercial prompts where recommendations happen, then back them with informational proof (pricing explainers, comparison criteria, methodology) and clean navigational pages (${brand} pricing, vs-pages, reviews) so fan-out brand-checks resolve in your favor.`
      : `Pick a brand in ${args.category} and re-run a live lookup to see mention gaps, then target the commercial prompts where leaders dominate.`,
    confidence: 0.84,
  });

  log.push("faq", `Prepared ${faqs.length} FAQ answers`);
  return { log: log.events, faqs };
}
