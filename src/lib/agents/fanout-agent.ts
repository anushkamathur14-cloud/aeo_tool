import { buildMockLookupAnswer } from "../domain/lookup";
import { createAgentLog } from "./types";

export type FanoutIntent = "commercial" | "informational" | "navigational";

export type FanoutNode = {
  id: string;
  parentId: string | null;
  query: string;
  intent: FanoutIntent;
  role: "root" | "evidence" | "brand-check";
  brandInQuery: boolean;
  brandMentioned: boolean | null;
  note: string;
};

export type EvidenceMap = {
  roots: number;
  fanouts: number;
  intentMix: Record<FanoutIntent, number>;
  /** Share of commercial-rooted fan-outs that are informational (evidence gathering). */
  evidenceShare: number;
  /** Share that are navigational brand/competitor lookups. */
  navigationalShare: number;
  /** Brand name appears inside a navigational fan-out query — strong recommendation signal. */
  brandInNavigationalQueries: number;
  /** Brand mentioned when those navigational queries are answered. */
  brandWinsNavigational: number;
  /** Informational evidence queries where brand still surfaces. */
  brandWinsEvidence: number;
  insight: string;
  nodes: FanoutNode[];
};

const COMMERCIAL_ROOT =
  /best|top|recommend|vs|versus|alternative|should i|buy|subscribe|worth|compare|pricing|cost/i;

export function isCommercialPrompt(prompt: string) {
  return COMMERCIAL_ROOT.test(prompt);
}

function hash(value: string) {
  let total = 0;
  for (let index = 0; index < value.length; index += 1) total = (total * 31 + value.charCodeAt(index)) >>> 0;
  return total;
}

function isOtt(category: string) {
  return /ott|streaming|video|cord.?cut|peacock|netflix|hulu|disney/i.test(category);
}

/**
 * Fan-out / evidence map agent.
 * Models how answer engines expand a commercial prompt into informational proof
 * and navigational brand checks before recommending — the Hinckley AI Overviews pattern.
 */
export function runFanoutAgent(args: {
  brand: string;
  category: string;
  peers: string[];
  commercialRoots: string[];
  /** When true, score leaf queries with deterministic demo answers. */
  scoreLeaves?: boolean;
}) {
  const log = createAgentLog();
  const brand = args.brand.trim();
  const category = args.category;
  const peer = args.peers[0] ?? "a leading competitor";
  const ott = isOtt(category);

  log.push("fanout", `Building evidence map for ${args.commercialRoots.length} commercial roots`);

  const nodes: FanoutNode[] = [];
  let nodeIndex = 0;

  for (const root of args.commercialRoots.slice(0, 4)) {
    const rootId = `root-${++nodeIndex}`;
    nodes.push({
      id: rootId,
      parentId: null,
      query: root,
      intent: "commercial",
      role: "root",
      brandInQuery: brand ? root.toLowerCase().includes(brand.toLowerCase()) : false,
      brandMentioned: null,
      note: "Commercial prompt where recommendations happen",
    });

    const evidenceQueries = ott
      ? [
          `How does personalized discovery work on ${category} platforms?`,
          `What makes a good ${category} catalog for cord-cutters?`,
          `${category} pricing plans explained: ad tier vs premium`,
          `How to evaluate live sports coverage on streaming services`,
        ]
      : [
          `What criteria matter when choosing ${category}?`,
          `${category} buying guide: quality vs value`,
          `How do experts evaluate ${category} brands?`,
          `${category} pricing and total cost of ownership explained`,
        ];

    const navigationalQueries = brand
      ? [
          `${brand} pricing`,
          `${brand} vs ${peer}`,
          `what is ${brand}`,
          `${brand} reviews`,
        ]
      : [
          `best ${category} brand official site`,
          `${peer} pricing`,
          `${peer} reviews`,
        ];

    // ~ mirror research mix: commercial roots spawn mostly evidence + navigational checks
    const evidencePick = evidenceQueries.slice(0, 2);
    const navPick = navigationalQueries.slice(0, 2);

    for (const query of evidencePick) {
      nodes.push({
        id: `leaf-${++nodeIndex}`,
        parentId: rootId,
        query,
        intent: "informational",
        role: "evidence",
        brandInQuery: brand ? query.toLowerCase().includes(brand.toLowerCase()) : false,
        brandMentioned: null,
        note: "Evidence query — engines gather facts to justify a recommendation",
      });
    }

    for (const query of navPick) {
      nodes.push({
        id: `leaf-${++nodeIndex}`,
        parentId: rootId,
        query,
        intent: "navigational",
        role: "brand-check",
        brandInQuery: brand ? query.toLowerCase().includes(brand.toLowerCase()) : false,
        brandMentioned: null,
        note: "Navigational check — engine looks up a brand by name before recommending",
      });
    }
  }

  if (args.scoreLeaves) {
    for (const node of nodes) {
      if (node.role === "root") continue;
      const mock = buildMockLookupAnswer({
        prompt: node.query,
        brand,
        category,
        peers: args.peers,
        engine: node.intent === "navigational" ? "Perplexity" : "ChatGPT",
      });
      // Navigational brand-in-query is a strong signal; still allow realistic misses on thin brands
      if (node.intent === "navigational" && node.brandInQuery) {
        const seed = hash(node.query + brand);
        node.brandMentioned = brand ? seed % 100 < 78 : false;
      } else {
        node.brandMentioned = mock.brandMentioned;
      }
    }
  }

  const leaves = nodes.filter((node) => node.role !== "root");
  const intentMix: Record<FanoutIntent, number> = {
    commercial: nodes.filter((n) => n.intent === "commercial").length,
    informational: nodes.filter((n) => n.intent === "informational").length,
    navigational: nodes.filter((n) => n.intent === "navigational").length,
  };
  const leafCount = Math.max(leaves.length, 1);
  const evidenceShare = Math.round((intentMix.informational / leafCount) * 1000) / 10;
  const navigationalShare = Math.round((intentMix.navigational / leafCount) * 1000) / 10;
  const brandInNavigationalQueries = leaves.filter(
    (n) => n.intent === "navigational" && n.brandInQuery,
  ).length;
  const brandWinsNavigational = leaves.filter(
    (n) => n.intent === "navigational" && n.brandMentioned,
  ).length;
  const brandWinsEvidence = leaves.filter(
    (n) => n.intent === "informational" && n.brandMentioned,
  ).length;

  const insight = brand
    ? brandWinsNavigational >= Math.max(1, Math.floor(brandInNavigationalQueries * 0.5))
      ? `${brand} shows up in navigational fan-outs — a strong signal engines are leaning toward recommending it. Keep pricing, comparison, and “what is” pages consistent so those brand-checks resolve cleanly.`
      : `${brand} is weak on navigational fan-outs. Commercial prompts still spawn brand-by-name searches (~¼ of fan-outs in AI Overview research); own ${brand} pricing, reviews, and vs-pages so the engine can justify recommending you.`
    : `Commercial prompts fan out into informational evidence and navigational brand checks. Add a brand name to see whether you survive those brand-checks.`;

  const map: EvidenceMap = {
    roots: args.commercialRoots.length,
    fanouts: leaves.length,
    intentMix,
    evidenceShare,
    navigationalShare,
    brandInNavigationalQueries,
    brandWinsNavigational,
    brandWinsEvidence,
    insight,
    nodes,
  };

  log.push("fanout", `Evidence map ready · ${leaves.length} fan-outs`, {
    evidenceShare,
    navigationalShare,
    brandWinsNavigational,
  });

  return { log: log.events, evidenceMap: map };
}
