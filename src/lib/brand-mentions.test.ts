import { describe, expect, it } from "vitest";
import { lookupBrandMentions, textMentionsBrand } from "./brand-mentions";

describe("brand mention lookup", () => {
  it("matches brand names without false substring hits", () => {
    expect(textMentionsBrand("Netflix leads the category", "Netflix")).toBe(true);
    expect(textMentionsBrand("Peacock includes OTT discovery", "OTT")).toBe(true);
    expect(textMentionsBrand("Peacock includes discovery", "OTT")).toBe(false);
  });

  it("counts Peacock mentions from the demo scan set", () => {
    const summary = lookupBrandMentions("Peacock");
    expect(summary.mentionCount).toBeGreaterThan(0);
    expect(summary.totalAnswers).toBeGreaterThan(summary.mentionCount);
    expect(summary.byEngine).toHaveLength(5);
  });

  it("finds competitor mentions inside answer snippets", () => {
    const summary = lookupBrandMentions("Netflix");
    expect(summary.mentionCount).toBeGreaterThan(0);
    expect(summary.hits.some((hit) => /netflix/i.test(hit.snippet))).toBe(true);
  });
});
