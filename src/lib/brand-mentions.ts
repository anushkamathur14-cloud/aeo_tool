import {
  BRAND,
  COMPETITORS,
  ENGINES,
  PROMPTS,
  type EngineId,
  type Prompt,
  type PromptCategory,
} from "./demo-data";
import { textMentionsBrand } from "./brand-mentions-core";

export { textMentionsBrand } from "./brand-mentions-core";

export type BrandMentionHit = {
  promptId: string;
  promptText: string;
  category: PromptCategory;
  engineId: EngineId;
  engineName: string;
  position: number | null;
  sentiment: string;
  snippet: string;
};

export type BrandMentionSummary = {
  brand: string;
  totalAnswers: number;
  mentionCount: number;
  mentionRate: number;
  avgPosition: number | null;
  byEngine: Array<{
    engineId: EngineId;
    engineName: string;
    color: string;
    answers: number;
    mentions: number;
    mentionRate: number;
    avgPosition: number | null;
  }>;
  byCategory: Array<{
    category: PromptCategory;
    answers: number;
    mentions: number;
    mentionRate: number;
  }>;
  hits: BrandMentionHit[];
  suggestedBrands: string[];
};

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

export function lookupBrandMentions(brandQuery: string, prompts: Prompt[] = PROMPTS): BrandMentionSummary {
  const brand = brandQuery.trim();
  const suggestedBrands = [BRAND.name, ...COMPETITORS.map((competitor) => competitor.name)];

  if (!brand) {
    return {
      brand: "",
      totalAnswers: 0,
      mentionCount: 0,
      mentionRate: 0,
      avgPosition: null,
      byEngine: [],
      byCategory: [],
      hits: [],
      suggestedBrands,
    };
  }

  const isTrackedBrand = brand.toLowerCase() === BRAND.name.toLowerCase();
  const hits: BrandMentionHit[] = [];
  const engineStats = new Map<
    EngineId,
    { answers: number; mentions: number; positions: number[] }
  >();
  const categoryStats = new Map<
    PromptCategory,
    { answers: number; mentions: number }
  >();

  for (const engine of ENGINES) {
    engineStats.set(engine.id, { answers: 0, mentions: 0, positions: [] });
  }

  let totalAnswers = 0;
  let mentionCount = 0;
  const positions: number[] = [];

  for (const prompt of prompts) {
    const category = categoryStats.get(prompt.category) ?? { answers: 0, mentions: 0 };
    for (const result of prompt.results) {
      totalAnswers += 1;
      category.answers += 1;
      const engine = engineStats.get(result.engineId)!;
      engine.answers += 1;

      const mentioned =
        (isTrackedBrand && result.mentioned) ||
        textMentionsBrand(result.snippet, brand) ||
        textMentionsBrand(prompt.text, brand);

      if (!mentioned) continue;

      mentionCount += 1;
      category.mentions += 1;
      engine.mentions += 1;
      if (typeof result.position === "number") {
        positions.push(result.position);
        engine.positions.push(result.position);
      }

      const engineMeta = ENGINES.find((entry) => entry.id === result.engineId)!;
      hits.push({
        promptId: prompt.id,
        promptText: prompt.text,
        category: prompt.category,
        engineId: result.engineId,
        engineName: engineMeta.name,
        position: result.position,
        sentiment: result.sentiment,
        snippet: result.snippet,
      });
    }
    categoryStats.set(prompt.category, category);
  }

  return {
    brand,
    totalAnswers,
    mentionCount,
    mentionRate: totalAnswers ? Math.round((mentionCount / totalAnswers) * 1000) / 10 : 0,
    avgPosition: average(positions),
    byEngine: ENGINES.map((engine) => {
      const stats = engineStats.get(engine.id)!;
      return {
        engineId: engine.id,
        engineName: engine.name,
        color: engine.color,
        answers: stats.answers,
        mentions: stats.mentions,
        mentionRate: stats.answers ? Math.round((stats.mentions / stats.answers) * 1000) / 10 : 0,
        avgPosition: average(stats.positions),
      };
    }),
    byCategory: Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        answers: stats.answers,
        mentions: stats.mentions,
        mentionRate: stats.answers ? Math.round((stats.mentions / stats.answers) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.mentions - a.mentions),
    hits: hits.sort((a, b) => (a.position ?? 99) - (b.position ?? 99)),
    suggestedBrands,
  };
}
