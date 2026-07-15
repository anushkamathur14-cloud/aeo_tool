import { describe, expect, it } from "vitest";
import { explainVisibility } from "./explanations";
import { generatePrompts } from "./prompts";
import { calculateVisibilityScore, SCORE_WEIGHTS, type ScoreComponents } from "./scoring";

const components: ScoreComponents = {
  mentionRate: 80,
  shareOfAnswers: 75,
  averageRank: 70,
  citationFrequency: 45,
  positiveRecommendation: 82,
  sentiment: 86,
  competitorShare: 68,
  authority: 42,
  contentCoverage: 62,
  entityRecognition: 74,
};

describe("BrandSignal domain", () => {
  it("keeps scoring weights normalized and score bounded", () => {
    expect(Object.values(SCORE_WEIGHTS).reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1);
    expect(calculateVisibilityScore(components)).toBeGreaterThan(0);
    expect(calculateVisibilityScore(components)).toBeLessThanOrEqual(100);
  });

  it("generates a balanced, capped customer-journey prompt set", () => {
    const prompts = generatePrompts(
      {
        company: "NovaCRM",
        website: "https://novacrm.example",
        industry: "CRM software",
        country: "United States",
        competitors: ["HubSpot", "Salesforce"],
        products: ["NovaCRM Growth"],
        audience: "B2B startups",
      },
      24,
    );
    expect(prompts).toHaveLength(24);
    expect(new Set(prompts.map((prompt) => prompt.stage))).toHaveLength(6);
    expect(prompts.some((prompt) => prompt.text.includes("NovaCRM"))).toBe(true);
  });

  it("prioritizes evidence-backed opportunities", () => {
    const explanations = explainVisibility(components);
    expect(explanations[0].confidence).toBeGreaterThan(0.8);
    expect(explanations.some((item) => item.code === "MISSING_CITATIONS")).toBe(true);
  });
});
