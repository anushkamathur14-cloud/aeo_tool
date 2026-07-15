import type { ScoreComponents } from "./scoring";

export type Explanation = {
  code: string;
  title: string;
  detail: string;
  confidence: number;
  category: string;
  expectedLift: number;
  effort: "Low" | "Medium" | "High";
};

export function explainVisibility(components: ScoreComponents): Explanation[] {
  const explanations: Explanation[] = [];
  const add = (explanation: Explanation) => explanations.push(explanation);

  if (components.citationFrequency < 60)
    add({
      code: "MISSING_CITATIONS",
      title: "Build third-party authority",
      detail: "AI answers cite competitors more often. Earn independent reviews and add verifiable statistics with primary sources.",
      confidence: 0.91,
      category: "Authority",
      expectedLift: 8.4,
      effort: "High",
    });
  if (components.contentCoverage < 70)
    add({
      code: "FAQ_GAP",
      title: "Close high-intent content gaps",
      detail: "Your site does not directly answer several discovery and purchase questions found in winning model responses.",
      confidence: 0.87,
      category: "Content",
      expectedLift: 6.8,
      effort: "Medium",
    });
  if (components.averageRank < 70)
    add({
      code: "WEAK_COMPARISON_CONTENT",
      title: "Publish evidence-led comparisons",
      detail: "Competitors rank earlier because models can find clearer use-case comparisons, trade-offs, and customer fit signals.",
      confidence: 0.89,
      category: "Comparisons",
      expectedLift: 7.2,
      effort: "Medium",
    });
  if (components.entityRecognition < 75)
    add({
      code: "ENTITY_AMBIGUITY",
      title: "Strengthen entity relationships",
      detail: "Connect the brand, products, audience, features, and category with Organization and Product schema plus consistent copy.",
      confidence: 0.82,
      category: "Knowledge Graph",
      expectedLift: 5.1,
      effort: "Low",
    });

  return explanations.sort((a, b) => b.expectedLift * b.confidence - a.expectedLift * a.confidence);
}
