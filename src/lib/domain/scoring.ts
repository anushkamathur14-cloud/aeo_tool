export type ScoreComponents = {
  mentionRate: number;
  shareOfAnswers: number;
  averageRank: number;
  citationFrequency: number;
  positiveRecommendation: number;
  sentiment: number;
  competitorShare: number;
  authority: number;
  contentCoverage: number;
  entityRecognition: number;
};

export const SCORE_WEIGHTS: Record<keyof ScoreComponents, number> = {
  mentionRate: 0.2,
  shareOfAnswers: 0.14,
  averageRank: 0.12,
  citationFrequency: 0.1,
  positiveRecommendation: 0.12,
  sentiment: 0.07,
  competitorShare: 0.08,
  authority: 0.07,
  contentCoverage: 0.06,
  entityRecognition: 0.04,
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));

/** Deterministic, transparent BrandSignal Visibility Score (0–100). */
export function calculateVisibilityScore(components: ScoreComponents) {
  const score = Object.entries(SCORE_WEIGHTS).reduce(
    (total, [key, weight]) => total + clamp(components[key as keyof ScoreComponents]) * weight,
    0,
  );
  return Math.round(score * 10) / 10;
}

export type ResponseMetric = {
  mentioned: boolean;
  mentionOrder?: number;
  cited: boolean;
  sentiment: number;
  recommendationStrength: number;
  competitorMentions: number;
};

export function componentsFromResponses(rows: ResponseMetric[]): ScoreComponents {
  if (!rows.length) {
    return Object.fromEntries(Object.keys(SCORE_WEIGHTS).map((key) => [key, 0])) as ScoreComponents;
  }
  const mentioned = rows.filter((row) => row.mentioned);
  const pct = (value: number) => clamp((value / rows.length) * 100);
  const average = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

  return {
    mentionRate: pct(mentioned.length),
    shareOfAnswers: pct(mentioned.length),
    averageRank: clamp(100 - (average(mentioned.map((row) => row.mentionOrder ?? 5)) - 1) * 20),
    citationFrequency: pct(rows.filter((row) => row.cited).length),
    positiveRecommendation: pct(rows.filter((row) => row.recommendationStrength >= 0.65).length),
    sentiment: clamp(average(rows.map((row) => row.sentiment)) * 100),
    competitorShare: clamp(100 - average(rows.map((row) => row.competitorMentions)) * 18),
    authority: pct(rows.filter((row) => row.cited && row.mentioned).length),
    contentCoverage: pct(new Set(rows.map((_, index) => Math.floor(index / 4))).size * 3),
    entityRecognition: pct(rows.filter((row) => row.mentioned && row.sentiment > 0.5).length),
  };
}
