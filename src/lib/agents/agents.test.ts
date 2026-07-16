import { describe, expect, it } from "vitest";
import { runClassificationAgent } from "./classification-agent";
import { runEvaluationAgent } from "./evaluation-agent";
import { runFaqAgent } from "./faq-agent";
import { estimateCostUsd } from "./types";

describe("lookup agents", () => {
  it("tracks estimated query cost", () => {
    expect(estimateCostUsd("gpt-4.1-mini", 1000, 500)).toBeGreaterThan(0);
    expect(estimateCostUsd("brandsignal-demo-v1", 1000, 500)).toBe(0);
  });

  it("evaluates brand mentions from responses", () => {
    const { evaluated } = runEvaluationAgent({
      brand: "Streamora",
      items: [
        {
          prompt: "Best OTT platform?",
          brand: "Streamora",
          peers: ["Netflix", "Hulu"],
          engineId: "chatgpt",
          engineName: "ChatGPT",
          color: "#fff",
          result: {
            provider: "mock",
            model: "brandsignal-demo-v1",
            text: "Streamora and Netflix are strong OTT options; Hulu is solid for TV.",
            latencyMs: 10,
            sources: [],
            mentions: [{ company: "Streamora", order: 1, sentiment: 0.8 }],
            recommendationStrength: 0.7,
            confidence: 0.8,
            answerLength: 20,
          },
        },
      ],
    });
    expect(evaluated[0].brandMentioned).toBe(true);
    expect(evaluated[0].brandPosition).toBe(1);
  });

  it("classifies intents and builds FAQs", () => {
    const classified = runClassificationAgent({
      brand: "Netflix",
      category: "OTT streaming",
      answers: [
        {
          prompt: "What is the best OTT platform?",
          engineId: "chatgpt",
          text: "Netflix is often recommended for originals.",
          brandMentioned: true,
        },
      ],
    });
    expect(classified.classified[0].intent).toBe("best-of");

    const faqs = runFaqAgent({
      brand: "Netflix",
      category: "OTT streaming",
      mode: "demo",
      mentionCount: 3,
      totalAnswers: 5,
      mentionRate: 60,
      avgPosition: 1.5,
      topBrands: [{ name: "Netflix", share: 40 }],
      totalCostUsd: 0,
      liveEngines: [],
    });
    expect(faqs.faqs.length).toBeGreaterThan(2);
  });
});
