import { describe, expect, it } from "vitest";
import { answerLookupChat, type LookupChatContext } from "./chat-agent";

const context: LookupChatContext = {
  brand: "Peacock",
  category: "OTT streaming",
  mode: "demo",
  mentionCount: 8,
  totalAnswers: 20,
  mentionRate: 40,
  avgPosition: 2.4,
  shareOfVoice: [
    { name: "Netflix", share: 35, count: 7 },
    { name: "Peacock", share: 28, count: 6 },
    { name: "Hulu", share: 18, count: 4 },
  ],
  byEngine: [
    { engineName: "Perplexity", mentions: 3, answers: 4, mentionRate: 75, avgPosition: 2 },
    { engineName: "Gemini", mentions: 1, answers: 4, mentionRate: 25, avgPosition: 4 },
    { engineName: "ChatGPT", mentions: 2, answers: 4, mentionRate: 50, avgPosition: 2.5 },
  ],
  faqs: [
    {
      question: "How often does Peacock show up?",
      answer: "Peacock appeared in 40% of answers.",
    },
  ],
  appearances: [
    {
      kind: "mentioned",
      prompt: "Best OTT streaming service in 2026?",
      engineName: "Perplexity",
      position: 2,
      snippet: "Peacock is frequently recommended…",
      peers: ["Netflix"],
    },
    {
      kind: "missed",
      prompt: "Top streaming platforms for cord-cutters",
      engineName: "Gemini",
      position: null,
      snippet: "Netflix, Hulu, and Disney+…",
      peers: ["Netflix", "Hulu"],
    },
  ],
  evidenceMap: {
    fanouts: 8,
    evidenceShare: 50,
    navigationalShare: 50,
    brandInNavigationalQueries: 4,
    brandWinsNavigational: 3,
    insight: "Peacock shows up in navigational fan-outs.",
  },
  results: [
    {
      prompt: "Best OTT streaming service in 2026?",
      engineName: "Perplexity",
      brandMentioned: true,
      brandPosition: 2,
      text: "Peacock is frequently recommended for discovery.",
      mentionedNames: ["Netflix", "Peacock"],
    },
    {
      prompt: "Top streaming platforms for cord-cutters",
      engineName: "Gemini",
      brandMentioned: false,
      brandPosition: null,
      text: "Netflix, Hulu, and Disney+ lead.",
      mentionedNames: ["Netflix", "Hulu", "Disney+"],
    },
  ],
  intentCounts: { "best-of": 3, comparison: 2 },
};

describe("lookup chat agent", () => {
  it("answers mention-rate questions from the run", () => {
    const result = answerLookupChat("How often does Peacock show up?", context);
    expect(result.answer).toMatch(/40%/);
    expect(result.suggestedFollowUps.length).toBeGreaterThan(0);
  });

  it("identifies the weakest engine", () => {
    const result = answerLookupChat("Which engine is weakest for Peacock?", context);
    expect(result.answer).toMatch(/Gemini/);
  });

  it("explains gaps", () => {
    const result = answerLookupChat("Where is Peacock missing?", context);
    expect(result.answer).toMatch(/Gemini|cord-cutters|missed/i);
  });
});
