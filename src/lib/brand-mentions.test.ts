import { describe, expect, it } from "vitest";
import { lookupBrandMentions, textMentionsBrand } from "./brand-mentions";

describe("brand mention lookup", () => {
  it("matches brand names without false substring hits", () => {
    expect(textMentionsBrand("HubSpot leads the category", "HubSpot")).toBe(true);
    expect(textMentionsBrand("NovaCRM includes CRM automation", "CRM")).toBe(true);
    expect(textMentionsBrand("NovaCRM includes automation", "CRM")).toBe(false);
  });

  it("counts NovaCRM mentions from the demo scan set", () => {
    const summary = lookupBrandMentions("NovaCRM");
    expect(summary.mentionCount).toBeGreaterThan(0);
    expect(summary.totalAnswers).toBeGreaterThan(summary.mentionCount);
    expect(summary.byEngine).toHaveLength(5);
  });

  it("finds competitor mentions inside answer snippets", () => {
    const summary = lookupBrandMentions("HubSpot");
    expect(summary.mentionCount).toBeGreaterThan(0);
    expect(summary.hits.some((hit) => /hubspot/i.test(hit.snippet))).toBe(true);
  });
});
