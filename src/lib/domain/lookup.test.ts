import { describe, expect, it } from "vitest";
import {
  buildMockLookupAnswer,
  generateLookupPrompts,
  peersForCategory,
  summarizeLookupResults,
} from "./lookup";

describe("on-demand category lookup", () => {
  it("resolves pet-category peers for Pedigree and Chewy style queries", () => {
    expect(peersForCategory("dog food")).toEqual(
      expect.arrayContaining(["Pedigree", "Chewy", "Purina Pro Plan"]),
    );
    expect(peersForCategory("pets")).toEqual(expect.arrayContaining(["Chewy", "Pedigree"]));
  });

  it("generates OTT-specific Peacock prompts", () => {
    const branded = generateLookupPrompts({
      brand: "Peacock",
      category: "OTT streaming",
      country: "United States",
      promptLimit: 6,
    });
    expect(branded).toHaveLength(6);
    expect(branded.some((prompt) => /OTT|streaming|cord-cut/i.test(prompt.text))).toBe(true);
    expect(branded.some((prompt) => /Peacock/i.test(prompt.text))).toBe(true);
  });

  it("builds realistic OTT mock answers with citations", () => {
    const mock = buildMockLookupAnswer({
      prompt: "What is the best OTT streaming service in 2026?",
      brand: "Peacock",
      category: "OTT streaming",
      peers: ["Netflix", "Hulu", "Disney+", "Max"],
      engine: "Perplexity",
    });
    expect(mock.text).toMatch(/streaming|OTT|cord|catalog|originals/i);
    expect(mock.text).not.toMatch(/onboarding|workflows|enterprise/i);
    expect(mock.sources?.length).toBeGreaterThan(0);
  });

  it("generates brand and category prompts", () => {
    const branded = generateLookupPrompts({
      brand: "Pedigree",
      category: "dog food",
      country: "United States",
      promptLimit: 6,
    });
    expect(branded).toHaveLength(6);
    expect(branded.some((prompt) => /Pedigree/i.test(prompt.text))).toBe(true);

    const categoryOnly = generateLookupPrompts({
      brand: "",
      category: "dogs",
      country: "United States",
      promptLimit: 6,
    });
    expect(categoryOnly.every((prompt) => /dogs/i.test(prompt.text))).toBe(true);
  });

  it("counts Pedigree mentions across mock engine answers", () => {
    const prompts = generateLookupPrompts({
      brand: "Pedigree",
      category: "dog food",
      country: "United States",
      promptLimit: 4,
    });
    const results = prompts.flatMap((prompt) =>
      ["ChatGPT", "Claude"].map((engine) => {
        const mock = buildMockLookupAnswer({
          prompt: prompt.text,
          brand: "Pedigree",
          category: "dog food",
          peers: prompt.peers,
          engine,
        });
        return {
          engineId: engine.toLowerCase(),
          engineName: engine,
          color: "#fff",
          prompt: prompt.text,
          text: mock.text,
          brandMentioned: mock.brandMentioned,
          brandPosition: mock.brandPosition,
          mentionedNames: mock.mentionedNames,
        };
      }),
    );

    const summary = summarizeLookupResults({
      brand: "Pedigree",
      category: "dog food",
      results,
    });
    expect(summary.totalAnswers).toBe(8);
    expect(summary.mentionCount).toBeGreaterThan(0);
    expect(summary.shareOfVoice.some((item) => item.name === "Pedigree")).toBe(true);
  });
});
