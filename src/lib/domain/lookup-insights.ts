import type { LookupEngineResult } from "./lookup";

export type LookupInsightInput = {
  brand: string;
  category: string;
  mode: "live" | "demo";
  mentionRate: number;
  mentionCount: number;
  totalAnswers: number;
  avgPosition: number | null;
  shareOfVoice: Array<{ name: string; share: number; count?: number }>;
  byEngine: Array<{
    engineName: string;
    mentions: number;
    answers: number;
    mentionRate: number;
    avgPosition: number | null;
    color?: string;
  }>;
  results: LookupEngineResult[];
  intentCounts?: Record<string, number>;
  appearances?: Array<{
    kind: "mentioned" | "missed";
    prompt: string;
    engineName: string;
    position: number | null;
    snippet: string;
    peers: string[];
  }>;
  evidenceMap?: {
    brandInNavigationalQueries: number;
    brandWinsNavigational: number;
  };
  faqs?: Array<{ question: string; answer: string; confidence: number }>;
};

export type ExecutiveSummary = {
  health: number;
  strongest: string;
  weakest: string;
  biggestOpportunity: string;
  expectedLift: number;
  confidence: number;
};

export type SpotlightMiss = {
  prompt: string;
  engineName: string;
  ranking: string[];
  brandMentioned: boolean;
  reasons: string[];
  estimatedGain: number;
  confidence: number;
};

export type PromptWinner = {
  prompt: string;
  winner: string;
  yourRank: number | null;
  brandWon: boolean;
};

export type FixQueueItem = {
  id: string;
  title: string;
  impact: "High" | "Medium" | "Low";
  stars: number;
  expectedLift: number;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  priority: number;
  evidence: string;
  affectedPrompts: number;
  confidence: number;
};

export type BrandUnderstanding = {
  brand: string;
  strong: string[];
  weak: string[];
};

export type ExplorerPrompt = {
  prompt: string;
  engines: Array<{
    engineId: string;
    engineName: string;
    color: string;
    brandMentioned: boolean;
    brandPosition: number | null;
    ranking: string[];
    text: string;
    whyWinner: string;
  }>;
};

export type LookupInsights = {
  executive: ExecutiveSummary;
  spotlight: SpotlightMiss | null;
  promptWinners: PromptWinner[];
  fixQueue: FixQueueItem[];
  brandUnderstanding: BrandUnderstanding;
  explorer: ExplorerPrompt[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function groupByPrompt(results: LookupEngineResult[]) {
  const map = new Map<string, LookupEngineResult[]>();
  for (const row of results) {
    const list = map.get(row.prompt) ?? [];
    list.push(row);
    map.set(row.prompt, list);
  }
  return map;
}

function missReasons(prompt: string, text: string, category: string) {
  const reasons: string[] = [];
  const p = prompt.toLowerCase();
  const t = text.toLowerCase();
  if (/vs|versus|compar|alternative/.test(p)) reasons.push("Weak comparison content");
  if (/price|cost|plan|subscription|how much/.test(p) || /price|cost|\$/.test(t))
    reasons.push("Missing or inconsistent pricing information");
  if (!reasons.some((reason) => /pricing/i.test(reason)) && /best|top|recommend/.test(p))
    reasons.push("Low third-party citations on best-of roundups");
  if (/sport|live|kids|download|offline/.test(p))
    reasons.push("Thin feature coverage in answer-ready pages");
  if (reasons.length === 0) {
    reasons.push(`Low answer-engine association with ${category}`);
    reasons.push("Few authoritative citations engines can reuse");
  }
  return reasons.slice(0, 3);
}

function associationTopics(category: string, brand: string, intentCounts?: Record<string, number>) {
  const cat = category.toLowerCase();
  const ott = /ott|streaming|video|peacock|netflix/.test(`${cat} ${brand.toLowerCase()}`);
  if (ott) {
    return {
      strong: ["OTT streaming", "Live sports", "Next-day TV", "Cord-cutting"],
      weak: ["Comparison hubs", "Pricing explainers", "Brand monitoring", "Competitive intelligence"],
    };
  }
  const intents = Object.keys(intentCounts ?? {});
  const strong = [
    category,
    intents.includes("best-of") ? "Best-of recommendations" : "Category discovery",
    intents.includes("pricing") ? "Pricing questions" : "Buyer research",
  ].slice(0, 4);
  const weak = ["Comparison content", "FAQ coverage", "Third-party citations", "Entity consistency"];
  return { strong, weak };
}

/**
 * Turns a lookup run into story-first insights for the results “wow” experience.
 */
export function buildLookupInsights(input: LookupInsightInput): LookupInsights {
  const brand = input.brand.trim();
  const byPrompt = groupByPrompt(input.results);
  const prompts = [...byPrompt.keys()];

  const strongestEngine = [...input.byEngine].sort((a, b) => b.mentionRate - a.mentionRate)[0];
  const weakestEngine = [...input.byEngine].sort((a, b) => a.mentionRate - b.mentionRate)[0];

  const health = clamp(
    input.mentionRate * 0.55 +
      (input.avgPosition ? Math.max(0, 100 - (input.avgPosition - 1) * 18) : 40) * 0.25 +
      Math.min(100, (input.shareOfVoice[0]?.share ?? 0) * 1.2) * 0.2,
  );

  const missCount = input.results.filter((row) => brand && !row.brandMentioned).length;
  const expectedLift = clamp(
    (100 - input.mentionRate) * 0.35 + (missCount / Math.max(input.totalAnswers, 1)) * 40,
    6,
    28,
  );

  const biggestOpportunity =
    missCount / Math.max(input.totalAnswers, 1) > 0.45
      ? "Comparison & best-of content"
      : input.avgPosition && input.avgPosition > 2.5
        ? "Recommendation rank (move into top 2)"
        : "Citation coverage on pricing pages";

  const executive: ExecutiveSummary = {
    health,
    strongest: strongestEngine
      ? `${strongestEngine.engineName} (${strongestEngine.mentionRate}%)`
      : "—",
    weakest: weakestEngine ? `${weakestEngine.engineName} (${weakestEngine.mentionRate}%)` : "—",
    biggestOpportunity,
    expectedLift,
    confidence: clamp(72 + Math.min(20, input.totalAnswers) + (input.mode === "live" ? 6 : 0)),
  };

  let spotlight: SpotlightMiss | null = null;
  for (const row of input.results) {
    if (!brand || row.brandMentioned) continue;
    const ranking = row.mentionedNames.length
      ? row.mentionedNames.slice(0, 4)
      : input.shareOfVoice.slice(0, 3).map((item) => item.name);
    if (!ranking.length) continue;
    spotlight = {
      prompt: row.prompt,
      engineName: row.engineName,
      ranking,
      brandMentioned: false,
      reasons: missReasons(row.prompt, row.text, input.category),
      estimatedGain: clamp(12 + ranking.length * 2 + (100 - input.mentionRate) * 0.08, 8, 24),
      confidence: clamp(84 + (input.mode === "live" ? 5 : 0)),
    };
    break;
  }

  const promptWinners: PromptWinner[] = prompts.slice(0, 8).map((prompt) => {
    const rows = byPrompt.get(prompt) ?? [];
    const mentioned = rows.filter((row) => row.brandMentioned);
    const leaderCounts = new Map<string, number>();
    for (const row of rows) {
      const leader = row.mentionedNames[0];
      if (!leader) continue;
      leaderCounts.set(leader, (leaderCounts.get(leader) ?? 0) + 1);
    }
    const winner =
      [...leaderCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
      input.shareOfVoice[0]?.name ??
      "—";
    const positions = mentioned
      .map((row) => row.brandPosition)
      .filter((value): value is number => typeof value === "number");
    const yourRank = positions.length
      ? Math.round((positions.reduce((sum, value) => sum + value, 0) / positions.length) * 10) / 10
      : null;
    return {
      prompt,
      winner,
      yourRank,
      brandWon: Boolean(brand && winner.toLowerCase() === brand.toLowerCase()),
    };
  });

  const comparisonMisses = input.results.filter(
    (row) => brand && !row.brandMentioned && /vs|alternative|best|compar/i.test(row.prompt),
  ).length;
  const pricingMisses = input.results.filter(
    (row) => brand && !row.brandMentioned && /price|cost|plan|subscription/i.test(row.prompt),
  ).length;
  const navGaps = input.evidenceMap
    ? Math.max(
        0,
        input.evidenceMap.brandInNavigationalQueries - input.evidenceMap.brandWinsNavigational,
      )
    : 0;

  const peer =
    input.shareOfVoice.find((row) => row.name.toLowerCase() !== brand.toLowerCase())?.name ??
    "category leader";

  const fixQueue = (
    [
      {
        id: "fix-compare",
        title: `Create ${brand || "brand"} vs ${peer} comparison page`,
        impact: "High",
        stars: 5,
        expectedLift: clamp(10 + comparisonMisses * 2, 8, 16),
        time: "2–3 hours",
        difficulty: "Easy",
        priority: 1,
        evidence: `${comparisonMisses || Math.max(1, Math.round(missCount * 0.4))} AI answers skipped ${brand || "your brand"} on comparison/best-of prompts.`,
        affectedPrompts: comparisonMisses || Math.max(1, Math.round(prompts.length * 0.35)),
        confidence: 91,
      },
      {
        id: "fix-pricing",
        title: "Publish answer-ready pricing FAQ + Offer schema",
        impact: "High",
        stars: 4,
        expectedLift: clamp(7 + pricingMisses * 2, 6, 12),
        time: "1–2 hours",
        difficulty: "Easy",
        priority: 2,
        evidence: `${pricingMisses || "Several"} pricing-related answers lacked a clear ${brand || "brand"} cite engines could reuse.`,
        affectedPrompts: pricingMisses || Math.max(1, Math.round(prompts.length * 0.25)),
        confidence: 88,
      },
      {
        id: "fix-citations",
        title: "Earn 3 third-party citations on review roundups",
        impact: "High",
        stars: 4,
        expectedLift: 9,
        time: "1–2 weeks",
        difficulty: "Hard",
        priority: 3,
        evidence: `Weakest engines (${weakestEngine?.engineName ?? "Gemini"}) lean on third-party lists where ${brand || "the brand"} is thin.`,
        affectedPrompts: Math.max(2, Math.round(prompts.length * 0.4)),
        confidence: 86,
      },
      {
        id: "fix-nav",
        title: `Own navigational pages (${brand || "brand"} pricing, reviews, vs-pages)`,
        impact: "Medium",
        stars: 3,
        expectedLift: clamp(5 + navGaps * 2, 5, 11),
        time: "3–4 hours",
        difficulty: "Medium",
        priority: 4,
        evidence:
          navGaps > 0
            ? `${navGaps} navigational fan-out brand-checks missed ${brand || "the brand"}.`
            : "Commercial prompts still spawn brand-by-name checks — keep facts consistent.",
        affectedPrompts: Math.max(1, input.evidenceMap?.brandInNavigationalQueries ?? 2),
        confidence: 84,
      },
    ] satisfies FixQueueItem[]
  ).sort((a, b) => a.priority - b.priority);

  const topics = associationTopics(input.category, brand, input.intentCounts);
  if (input.intentCounts?.["best-of"] && input.mentionRate >= 45) {
    topics.strong = ["Best-of recommendations", ...topics.strong].slice(0, 4);
  }
  if (input.mentionRate < 40) {
    topics.weak = ["Top-of-funnel recommendations", ...topics.weak].slice(0, 4);
  }

  const brandUnderstanding: BrandUnderstanding = {
    brand: brand || "Your brand",
    strong: topics.strong,
    weak: topics.weak,
  };

  const explorer: ExplorerPrompt[] = prompts.map((prompt) => {
    const rows = byPrompt.get(prompt) ?? [];
    return {
      prompt,
      engines: rows.map((row) => {
        const ranking = row.mentionedNames.slice(0, 5);
        const winner = ranking[0] ?? "—";
        const whyWinner = row.brandMentioned
          ? `${brand} appeared${row.brandPosition ? ` at #${row.brandPosition}` : ""} in this answer.`
          : `${winner} led this ${row.engineName} answer — ${missReasons(prompt, row.text, input.category)[0].toLowerCase()}.`;
        return {
          engineId: row.engineId,
          engineName: row.engineName,
          color: row.color,
          brandMentioned: row.brandMentioned,
          brandPosition: row.brandPosition,
          ranking,
          text: row.text,
          whyWinner,
        };
      }),
    };
  });

  return {
    executive,
    spotlight,
    promptWinners,
    fixQueue,
    brandUnderstanding,
    explorer,
  };
}
