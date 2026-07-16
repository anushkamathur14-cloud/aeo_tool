import { z } from "zod";
import { textMentionsBrand } from "../brand-mentions-core";

export const onDemandLookupSchema = z
  .object({
    brand: z.string().trim().max(80).optional().default(""),
    category: z.string().trim().max(80).optional().default(""),
    country: z.string().trim().min(2).max(80).default("United States"),
    promptLimit: z.number().int().min(4).max(18).default(8),
  })
  .refine((value) => value.brand.length >= 2 || value.category.length >= 2, {
    message: "Provide a brand and/or a category",
  });

export type OnDemandLookupInput = z.infer<typeof onDemandLookupSchema>;

const CATEGORY_PEERS: Record<string, string[]> = {
  pets: ["Pedigree", "Purina", "Royal Canin", "Chewy", "BarkBox", "Whiskas"],
  pet: ["Pedigree", "Purina", "Royal Canin", "Chewy", "BarkBox", "Whiskas"],
  dogs: ["Pedigree", "Purina Pro Plan", "Royal Canin", "Blue Buffalo", "Chewy", "Bark"],
  dog: ["Pedigree", "Purina Pro Plan", "Royal Canin", "Blue Buffalo", "Chewy", "Bark"],
  cats: ["Whiskas", "Purina", "Royal Canin", "Chewy", "Fancy Feast"],
  cat: ["Whiskas", "Purina", "Royal Canin", "Chewy", "Fancy Feast"],
  "pet food": ["Pedigree", "Purina", "Royal Canin", "Hill's", "Blue Buffalo", "Chewy"],
  "dog food": ["Pedigree", "Purina Pro Plan", "Royal Canin", "Blue Buffalo", "Hill's", "Chewy"],
  ecommerce: ["Chewy", "Amazon", "Walmart", "Petco", "Petsmart"],
  crm: ["HubSpot", "Salesforce", "Pipedrive", "Attio", "Zoho"],
  ott: ["Netflix", "Prime Video", "Hulu", "Disney+", "Max", "Paramount+"],
  streaming: ["Netflix", "Prime Video", "Hulu", "Disney+", "Max", "Paramount+"],
  "streaming video": ["Netflix", "Prime Video", "Hulu", "Disney+", "Max", "Paramount+"],
  "ott streaming": ["Netflix", "Prime Video", "Hulu", "Disney+", "Max", "Paramount+"],
  coffee: ["Starbucks", "Dunkin", "Peet's", "Blue Bottle", "Nespresso"],
  sneakers: ["Nike", "Adidas", "New Balance", "Hoka", "Allbirds"],
};

const GENERIC_PEERS = ["Market Leader Co", "Heritage Brand", "Value Pick", "Premium Choice", "Direct-to-consumer rival"];

export function peersForCategory(category: string, brand?: string) {
  const key = category.trim().toLowerCase();
  const matchedKey = Object.keys(CATEGORY_PEERS).find(
    (entry) => key === entry || key.includes(entry) || entry.includes(key),
  );
  const peers = matchedKey ? [...CATEGORY_PEERS[matchedKey]] : [...GENERIC_PEERS];
  if (brand) {
    const filtered = peers.filter((peer) => peer.toLowerCase() !== brand.toLowerCase());
    return filtered.length ? filtered : peers;
  }
  return peers;
}

export function inferCategory(brand: string, category: string) {
  if (category.trim()) return category.trim();
  const lower = brand.toLowerCase();
  if (["pedigree", "purina", "whiskas", "royal canin", "blue buffalo"].some((item) => lower.includes(item)))
    return "dog food";
  if (["chewy", "petco", "petsmart", "barkbox"].some((item) => lower.includes(item))) return "pets";
  if (["hubspot", "salesforce", "pipedrive", "attio"].some((item) => lower.includes(item)))
    return "CRM software";
  if (["peacock", "netflix", "hulu", "disney", "prime video", "max", "paramount"].some((item) => lower.includes(item)))
    return "OTT / streaming video";
  return "consumer brands";
}

function isOttCategory(category: string) {
  return /ott|streaming|video|cord.?cut/i.test(category);
}

export function generateLookupPrompts(input: OnDemandLookupInput) {
  const brand = input.brand.trim();
  const category = inferCategory(brand, input.category);
  const peers = peersForCategory(category, brand || undefined);
  const competitor = peers[0] ?? "a leading alternative";
  const focus = brand || category;
  const ott = isOttCategory(category);

  const brandedOtt = [
    `What is the best OTT streaming service in 2026?`,
    `Best streaming platforms for cord-cutters in ${input.country}`,
    `${brand} vs ${competitor}: which is better for a streaming household?`,
    `Is ${brand} worth subscribing to?`,
    `Top Netflix alternatives for originals and discovery`,
    `Which streaming service has the best personalized recommendations?`,
    `Should I switch from ${competitor} to ${brand}?`,
    `${brand} pricing: Standard vs Premium — which plan?`,
    `Best ${category} for live sports and cord-cutting`,
    `What do reviewers say about ${brand} originals?`,
  ];

  const categoryOtt = [
    `What are the best OTT streaming services right now?`,
    `Top streaming recommendations in ${input.country}`,
    `Best value streaming platforms for cord-cutters`,
    `Which streaming services do experts recommend in 2026?`,
    `Netflix vs Hulu vs Disney+: which should I pick?`,
    `Streaming buying guide: ad tier vs premium plans`,
    `Best platforms for originals and personalized discovery`,
    `Popular streaming alternatives worth considering`,
  ];

  const brandedGeneric = [
    `What is the best ${category} for everyday use?`,
    `Best ${category} brands in ${input.country}`,
    `${brand} vs ${competitor}: which is better?`,
    `Is ${brand} good for ${category}?`,
    `Top alternatives to ${brand}`,
    `What do people recommend for ${category}?`,
    `Should I buy ${brand}?`,
    `Which ${category} brands are most trusted?`,
    `${category} recommendations for beginners`,
    `Where should I buy ${category} online?`,
  ];

  const categoryGeneric = [
    `What are the best ${category} brands right now?`,
    `Top ${category} recommendations in ${input.country}`,
    `Which ${category} products do experts recommend?`,
    `Best value options for ${category}`,
    `Most trusted ${category} brands`,
    `${category} buying guide for beginners`,
    `What should I look for when choosing ${category}?`,
    `Popular ${category} alternatives worth considering`,
  ];

  const templates = ott
    ? brand
      ? brandedOtt
      : categoryOtt
    : brand
      ? brandedGeneric
      : categoryGeneric;

  return templates.slice(0, input.promptLimit).map((text, index) => ({
    id: `lookup-${index + 1}`,
    text,
    category,
    focus,
    peers,
  }));
}

function hash(value: string) {
  let total = 0;
  for (let index = 0; index < value.length; index += 1) total = (total * 31 + value.charCodeAt(index)) >>> 0;
  return total;
}

function engineBias(engine: string, brand: string, prompt: string) {
  const e = engine.toLowerCase();
  const brandedPrompt = brand ? prompt.toLowerCase().includes(brand.toLowerCase()) : false;
  // Gemini often omits challenger brands on generic best-of; Perplexity cites more freely.
  if (e.includes("gemini") && !brandedPrompt) return -22;
  if (e.includes("copilot") && !brandedPrompt) return -12;
  if (e.includes("perplexity")) return 10;
  if (e.includes("chatgpt")) return 4;
  if (e.includes("claude")) return 0;
  return 0;
}

export function buildMockLookupAnswer(args: {
  prompt: string;
  brand: string;
  category: string;
  peers: string[];
  engine: string;
}) {
  const { prompt, brand, category, peers, engine } = args;
  const seed = hash(`${engine}:${prompt}:${brand}:${category}`);
  const orderedPeers = [...peers].sort(
    (a, b) => hash(`${engine}:${a}`) - hash(`${engine}:${b}`),
  );
  const ott = isOttCategory(category) || /peacock|netflix|hulu|disney|prime video|\bmax\b/i.test(brand);
  const baseRate = prompt.toLowerCase().includes(brand.toLowerCase()) ? 86 : ott ? 52 : 58;
  const includeBrand = brand ? seed % 100 < Math.max(18, Math.min(92, baseRate + engineBias(engine, brand, prompt))) : false;

  let names = includeBrand
    ? [brand, ...orderedPeers]
        .filter((value, index, list) => list.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index)
        .slice(0, 4)
    : orderedPeers.slice(0, 4);

  // Challengers often land mid-list on generic best-of; named prompts push them higher.
  if (
    includeBrand &&
    brand &&
    ott &&
    !prompt.toLowerCase().includes(brand.toLowerCase()) &&
    names[0]?.toLowerCase() === brand.toLowerCase()
  ) {
    const leader = orderedPeers.find((peer) => peer.toLowerCase() !== brand.toLowerCase());
    if (leader) {
      names = [leader, ...names.filter((name) => name.toLowerCase() !== leader.toLowerCase())].slice(0, 4);
      if (!names.some((name) => name.toLowerCase() === brand.toLowerCase())) {
        names.splice(Math.min(2, names.length), 0, brand);
        names = names.slice(0, 4);
      }
    }
  }

  const leader = names[0];
  const runnerUp = names[1] ?? "another strong option";
  const brandPosition = includeBrand
    ? names.findIndex((name) => name.toLowerCase() === brand.toLowerCase()) + 1
    : null;

  const citations = ott
    ? engine.toLowerCase().includes("perplexity")
      ? ["variety.com", "techradar.com", "reddit.com/r/cordcutters"]
      : engine.toLowerCase().includes("gemini")
        ? ["forbes.com", "disneyplus.com"]
        : ["rottentomatoes.com", "techradar.com", "pcmag.com"]
    : ["example.com/reviews", "example.com/report"];

  let text: string;
  if (ott) {
    if (!includeBrand && brand) {
      text = `Top picks for ${category} right now usually include ${names.slice(0, 3).join(", ")} depending on catalog depth, price, and household needs. ${engine} answers often lean on well-known catalogs first. ${brand} is less consistently recommended for this exact prompt — stronger comparison pages and third-party citations would help. Sources often referenced: ${citations.join(", ")}.`;
    } else if (prompt.toLowerCase().includes("vs") || prompt.toLowerCase().includes("versus")) {
      text = `${leader} vs ${runnerUp}: ${leader} tends to win on ${
        leader.toLowerCase() === brand.toLowerCase() ? "personalized discovery and Premium plan value" : "catalog breadth and brand familiarity"
      }, while ${runnerUp} is stronger on ${
        runnerUp.toLowerCase() === brand.toLowerCase() ? "recommendation quality" : "content volume and recognition"
      }. For cord-cutters, I recommend checking live-sports windows, ad-tier limits, and originals cadence before committing. Often cited: ${citations.join(", ")}.`;
    } else if (/pric|plan|subscribe|worth/i.test(prompt)) {
      text = `For streaming value, ${leader} is frequently recommended because plan tiers are easy to explain and compare. ${
        includeBrand
          ? `${brand} shows up when answers discuss Standard vs Premium and whether the household needs live sports.`
          : `${runnerUp} is the usual runner-up on price-to-catalog tradeoffs.`
      } Compare ad-supported tiers, concurrent streams, and annual billing before buying. Common sources: ${citations.join(", ")}.`;
    } else {
      text = `For ${category}, ${leader} is frequently recommended in ${engine} answers for originals and day-to-day viewing. ${runnerUp} is often compared for catalog breadth or bundled pricing. ${
        includeBrand
          ? brandPosition === 1
            ? `${brand} leads this shortlist when personalized discovery and transparent plans matter.`
            : `${brand} typically appears around #${brandPosition} — present, but not always the first recommendation.`
          : `These names dominate common ${category} recommendations.`
      } I recommend matching the service to household profiles, sports needs, and how much you care about algorithmic discovery. Often cited: ${citations.join(", ")}.`;
    }
  } else {
    text = `For ${category}, ${leader} is frequently recommended in ${engine} answers because of brand familiarity and availability. ${runnerUp} is often compared for assortment or price. ${
      includeBrand
        ? `${brand} appears in this shortlist for shoppers evaluating ${category}.`
        : brand
          ? `${brand} is less consistently cited for this exact prompt.`
          : `These names dominate common ${category} recommendations.`
    } I recommend comparing features, reviews, and total cost before deciding.`;
  }

  return {
    text,
    mentionedNames: names,
    brandMentioned: includeBrand,
    brandPosition: brandPosition && brandPosition > 0 ? brandPosition : null,
    sources: citations.map((title) => ({
      title,
      url: `https://${title.replace(/^\/+/, "")}`,
    })),
  };
}

export type LookupEngineResult = {
  engineId: string;
  engineName: string;
  color: string;
  prompt: string;
  text: string;
  brandMentioned: boolean;
  brandPosition: number | null;
  mentionedNames: string[];
};

export function summarizeLookupResults(args: {
  brand: string;
  category: string;
  results: LookupEngineResult[];
}) {
  const { brand, category, results } = args;
  const totalAnswers = results.length;
  const mentionHits = brand
    ? results.filter((result) => result.brandMentioned || textMentionsBrand(result.text, brand))
    : [];
  const mentionCount = brand ? mentionHits.length : 0;
  const positions = mentionHits
    .map((result) => result.brandPosition)
    .filter((value): value is number => typeof value === "number");

  const brandCounts = new Map<string, number>();
  for (const result of results) {
    for (const name of result.mentionedNames) {
      brandCounts.set(name, (brandCounts.get(name) ?? 0) + 1);
    }
  }

  const shareOfVoice = Array.from(brandCounts.entries())
    .map(([name, count]) => ({
      name,
      count,
      share: totalAnswers ? Math.round((count / totalAnswers) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const byEngineMap = new Map<string, { engineName: string; color: string; answers: number; mentions: number; positions: number[] }>();
  for (const result of results) {
    const current = byEngineMap.get(result.engineId) ?? {
      engineName: result.engineName,
      color: result.color,
      answers: 0,
      mentions: 0,
      positions: [],
    };
    current.answers += 1;
    if (brand && (result.brandMentioned || textMentionsBrand(result.text, brand))) {
      current.mentions += 1;
      if (result.brandPosition) current.positions.push(result.brandPosition);
    }
    byEngineMap.set(result.engineId, current);
  }

  return {
    brand,
    category,
    totalAnswers,
    mentionCount,
    mentionRate: brand && totalAnswers ? Math.round((mentionCount / totalAnswers) * 1000) / 10 : 0,
    avgPosition: positions.length
      ? Math.round((positions.reduce((sum, value) => sum + value, 0) / positions.length) * 10) / 10
      : null,
    shareOfVoice,
    byEngine: Array.from(byEngineMap.entries()).map(([engineId, stats]) => ({
      engineId,
      engineName: stats.engineName,
      color: stats.color,
      answers: stats.answers,
      mentions: stats.mentions,
      mentionRate: stats.answers ? Math.round((stats.mentions / stats.answers) * 1000) / 10 : 0,
      avgPosition: stats.positions.length
        ? Math.round((stats.positions.reduce((sum, value) => sum + value, 0) / stats.positions.length) * 10) / 10
        : null,
    })),
    results,
  };
}
