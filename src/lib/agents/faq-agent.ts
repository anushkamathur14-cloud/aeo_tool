import type { EvidenceMap } from "./fanout-agent";
import { createAgentLog } from "./types";

export type FaqItem = {
  question: string;
  answer: string;
  confidence: number;
  kind?: "stats" | "appearance" | "competitive" | "action";
};

export type AppearanceContext = {
  kind: "mentioned" | "missed";
  prompt: string;
  engineName: string;
  position: number | null;
  snippet: string;
  peers: string[];
};

/**
 * FAQ Agent — user-facing questions about where the brand shows up and why.
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
  results?: Array<{
    prompt: string;
    engineName: string;
    brandMentioned: boolean;
    brandPosition: number | null;
    text: string;
    mentionedNames: string[];
  }>;
  intentCounts?: Record<string, number>;
}) {
  const log = createAgentLog();
  log.push("faq", "Generating user FAQs and appearance context");

  const leader = args.topBrands[0]?.name ?? "category leaders";
  const brand = args.brand || "your brand";
  const results = args.results ?? [];
  const mentioned = results.filter((row) => row.brandMentioned);
  const missed = results.filter((row) => !row.brandMentioned);
  const topEngines = [...(args.results ? groupEngineMentions(results) : [])]
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 3);

  const appearances: AppearanceContext[] = [
    ...mentioned.slice(0, 4).map((row) => ({
      kind: "mentioned" as const,
      prompt: row.prompt,
      engineName: row.engineName,
      position: row.brandPosition,
      snippet: truncate(row.text, 160),
      peers: row.mentionedNames.filter((name) => name.toLowerCase() !== brand.toLowerCase()).slice(0, 3),
    })),
    ...missed.slice(0, 3).map((row) => ({
      kind: "missed" as const,
      prompt: row.prompt,
      engineName: row.engineName,
      position: null,
      snippet: truncate(row.text, 160),
      peers: row.mentionedNames.slice(0, 3),
    })),
  ];

  const faqs: FaqItem[] = [];

  if (args.brand) {
    faqs.push({
      kind: "stats",
      question: `How often does ${brand} show up for ${args.category}?`,
      answer: `${brand} appeared in ${args.mentionCount} of ${args.totalAnswers} answers (${args.mentionRate}% mention rate)${
        args.avgPosition ? `, usually around #${args.avgPosition} when listed` : ""
      }.`,
      confidence: 0.93,
    });
  } else {
    faqs.push({
      kind: "stats",
      question: `Who shows up for ${args.category}?`,
      answer: `${leader} leads this category scan. Add a brand name to measure inclusion rate and average position.`,
      confidence: 0.9,
    });
  }

  if (mentioned.length) {
    const sample = mentioned[0];
    faqs.push({
      kind: "appearance",
      question: `Where does ${brand} get recommended?`,
      answer: `${brand} shows up most clearly on prompts like “${sample.prompt}” — e.g. on ${sample.engineName}${
        sample.brandPosition ? ` at #${sample.brandPosition}` : ""
      }. Across this run it was mentioned in ${mentioned.length} answers.`,
      confidence: 0.9,
    });
  }

  if (missed.length && args.brand) {
    const sample = missed[0];
    const peers = sample.mentionedNames.slice(0, 2).join(" and ") || leader;
    faqs.push({
      kind: "appearance",
      question: `Where is ${brand} missing?`,
      answer: `${brand} was absent from ${missed.length} answers. Example gap: “${sample.prompt}” on ${sample.engineName}, where ${peers} got recommended instead.`,
      confidence: 0.88,
    });
  }

  faqs.push({
    kind: "competitive",
    question: `Who leads share of voice in ${args.category}?`,
    answer: args.topBrands.length
      ? `${args.topBrands
          .slice(0, 3)
          .map((row) => `${row.name} (${row.share}%)`)
          .join(", ")} appear most often in the evaluated answers.`
      : `Not enough brand entities were extracted from ${args.category} answers yet.`,
    confidence: 0.88,
  });

  if (topEngines.length && args.brand) {
    faqs.push({
      kind: "appearance",
      question: `Which engines mention ${brand} most?`,
      answer: topEngines
        .map((row) => `${row.engineName} (${row.mentions}/${row.answers})`)
        .join(", "),
      confidence: 0.9,
    });
  }

  if (args.intentCounts && Object.keys(args.intentCounts).length) {
    const topIntent = Object.entries(args.intentCounts).sort((a, b) => b[1] - a[1])[0];
    faqs.push({
      kind: "appearance",
      question: `In what kinds of questions does ${brand} appear?`,
      answer: `This run skewed toward ${Object.entries(args.intentCounts)
        .map(([intent, count]) => `${intent} (${count})`)
        .join(", ")}. Dominant context: ${topIntent[0]} prompts.`,
      confidence: 0.86,
    });
  }

  if (args.evidenceMap) {
    const map = args.evidenceMap;
    faqs.push({
      kind: "appearance",
      question: args.brand
        ? `Does ${brand} survive the fan-outs behind recommendations?`
        : "What happens in fan-outs before a recommendation?",
      answer: args.brand
        ? `Commercial prompts spawned ${map.fanouts} fan-outs (~${map.evidenceShare}% evidence, ~${map.navigationalShare}% navigational). ${brand} was in ${map.brandInNavigationalQueries} brand-check queries and won ${map.brandWinsNavigational}. ${map.insight}`
        : `Commercial prompts expanded into ${map.fanouts} fan-outs (~${map.evidenceShare}% evidence, ~${map.navigationalShare}% navigational). ${map.insight}`,
      confidence: 0.87,
    });
  }

  faqs.push({
    kind: "action",
    question: `What should I ask next about ${brand}?`,
    answer: `Try the chat below — ask which engine is weakest, who beats ${brand} on comparisons, or what content would close the biggest gaps.`,
    confidence: 0.84,
  });

  faqs.push({
    kind: "action",
    question: `What should I do next to improve AEO visibility for ${brand}?`,
    answer: args.brand
      ? `Prioritize commercial prompts where recommendations happen, publish clean navigational pages (${brand} pricing, vs-pages, reviews), and back them with informational proof engines use as evidence during fan-out.`
      : `Pick a brand in ${args.category} and re-run a lookup to see mention gaps, then target the commercial prompts where leaders dominate.`,
    confidence: 0.84,
  });

  log.push("faq", `Prepared ${faqs.length} FAQs and ${appearances.length} appearance contexts`);
  return { log: log.events, faqs, appearances };
}

function truncate(text: string, max: number) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function groupEngineMentions(
  results: Array<{ engineName: string; brandMentioned: boolean }>,
) {
  const map = new Map<string, { engineName: string; answers: number; mentions: number }>();
  for (const row of results) {
    const current = map.get(row.engineName) ?? {
      engineName: row.engineName,
      answers: 0,
      mentions: 0,
    };
    current.answers += 1;
    if (row.brandMentioned) current.mentions += 1;
    map.set(row.engineName, current);
  }
  return Array.from(map.values());
}
