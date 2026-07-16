// Static demo dataset for BrandSignal — AEO (Answer Engine Optimization)
// analytics for the fictional brand "Streamora".

export const BRAND = {
  name: "Streamora",
  domain: "streamora.com",
  description:
    "Premium streaming service known for originals and personalized discovery. Built for cord-cutters and streaming households in the United States.",
  category: "OTT / streaming video",
};

export type EngineId = "chatgpt" | "claude" | "perplexity" | "gemini" | "copilot";

export interface Engine {
  id: EngineId;
  name: string;
  vendor: string;
  color: string;
  mentionRate: number; // % of tracked prompts where Streamora is mentioned
  avgPosition: number; // avg rank when mentioned
  trend: number; // pp change vs previous period
}

export const ENGINES: Engine[] = [
  { id: "chatgpt", name: "ChatGPT", vendor: "OpenAI", color: "#34d399", mentionRate: 58, avgPosition: 2.4, trend: 6.2 },
  { id: "perplexity", name: "Perplexity", vendor: "Perplexity AI", color: "#38bdf8", mentionRate: 64, avgPosition: 2.1, trend: 4.8 },
  { id: "claude", name: "Claude", vendor: "Anthropic", color: "#f59e0b", mentionRate: 47, avgPosition: 3.0, trend: 2.1 },
  { id: "gemini", name: "Gemini", vendor: "Google", color: "#818cf8", mentionRate: 41, avgPosition: 3.6, trend: -1.4 },
  { id: "copilot", name: "Copilot", vendor: "Microsoft", color: "#f472b6", mentionRate: 35, avgPosition: 4.1, trend: 0.9 },
];

export interface Competitor {
  id: string;
  name: string;
  domain: string;
  shareOfVoice: number; // %
  mentionRate: number; // %
  avgPosition: number;
  trend: number;
  sentiment: number; // 0-100 positive
  strongestEngine: EngineId;
  note: string;
}

export const COMPETITORS: Competitor[] = [
  {
    id: "netflix",
    name: "Netflix",
    domain: "netflix.com",
    shareOfVoice: 27.4,
    mentionRate: 91,
    avgPosition: 1.3,
    trend: -0.8,
    sentiment: 81,
    strongestEngine: "chatgpt",
    note: "Dominates broad 'best streaming' prompts on every engine. Weakest on price-sensitive and ad-tier queries.",
  },
  {
    id: "prime",
    name: "Amazon Prime Video",
    domain: "primevideo.com",
    shareOfVoice: 24.1,
    mentionRate: 88,
    avgPosition: 1.7,
    trend: -1.6,
    sentiment: 72,
    strongestEngine: "gemini",
    note: "Cited as the default bundle with Amazon Prime. Frequently flagged for cluttered UI in answers.",
  },
  {
    id: "hulu",
    name: "Hulu",
    domain: "hulu.com",
    shareOfVoice: 14.9,
    mentionRate: 74,
    avgPosition: 2.6,
    trend: 1.1,
    sentiment: 84,
    strongestEngine: "perplexity",
    note: "Owns 'next-day TV' and live Hulu + Live TV positioning. Strong Reddit citation footprint.",
  },
  {
    id: "streamora",
    name: "Streamora",
    domain: "streamora.com",
    shareOfVoice: 12.2,
    mentionRate: 49,
    avgPosition: 2.8,
    trend: 3.4,
    sentiment: 88,
    strongestEngine: "perplexity",
    note: "Rising fast on originals and personalized discovery prompts. Under-cited on comparison and pricing queries.",
  },
  {
    id: "disney",
    name: "Disney+",
    domain: "disneyplus.com",
    shareOfVoice: 11.8,
    mentionRate: 69,
    avgPosition: 3.1,
    trend: -0.3,
    sentiment: 76,
    strongestEngine: "copilot",
    note: "Wins on family and kids-profile prompts. Answers often mention the Disney Bundle as a differentiator.",
  },
  {
    id: "max",
    name: "Max",
    domain: "max.com",
    shareOfVoice: 9.6,
    mentionRate: 44,
    avgPosition: 3.4,
    trend: 2.7,
    sentiment: 86,
    strongestEngine: "claude",
    note: "Closest rival on prestige originals prompts. Growing citation base from awards-season coverage.",
  },
];

export interface VisibilityPoint {
  week: string; // ISO date (week start)
  label: string;
  streamora: number;
  netflix: number;
  prime: number;
  hulu: number;
  disney: number;
  max: number;
}

// 12 weeks of visibility score (0-100 composite of mention rate + position)
export const VISIBILITY_TREND: VisibilityPoint[] = [
  { week: "2026-04-27", label: "Apr 27", streamora: 31, netflix: 74, prime: 71, hulu: 52, disney: 48, max: 27 },
  { week: "2026-05-04", label: "May 4", streamora: 33, netflix: 75, prime: 70, hulu: 53, disney: 49, max: 28 },
  { week: "2026-05-11", label: "May 11", streamora: 32, netflix: 73, prime: 71, hulu: 51, disney: 47, max: 30 },
  { week: "2026-05-18", label: "May 18", streamora: 36, netflix: 74, prime: 69, hulu: 52, disney: 48, max: 31 },
  { week: "2026-05-25", label: "May 25", streamora: 38, netflix: 72, prime: 68, hulu: 54, disney: 50, max: 30 },
  { week: "2026-06-01", label: "Jun 1", streamora: 37, netflix: 73, prime: 68, hulu: 53, disney: 49, max: 32 },
  { week: "2026-06-08", label: "Jun 8", streamora: 41, netflix: 71, prime: 67, hulu: 55, disney: 51, max: 33 },
  { week: "2026-06-15", label: "Jun 15", streamora: 43, netflix: 72, prime: 66, hulu: 54, disney: 50, max: 35 },
  { week: "2026-06-22", label: "Jun 22", streamora: 45, netflix: 70, prime: 66, hulu: 55, disney: 52, max: 34 },
  { week: "2026-06-29", label: "Jun 29", streamora: 47, netflix: 71, prime: 65, hulu: 56, disney: 51, max: 36 },
  { week: "2026-07-06", label: "Jul 6", streamora: 49, netflix: 70, prime: 65, hulu: 55, disney: 52, max: 37 },
  { week: "2026-07-13", label: "Jul 13", streamora: 52, netflix: 69, prime: 64, hulu: 56, disney: 53, max: 38 },
];

export type Sentiment = "positive" | "neutral" | "negative";
export type PromptCategory =
  | "Comparison"
  | "Best-of list"
  | "Pricing"
  | "Use case"
  | "Alternatives"
  | "How-to";

export interface EngineResult {
  engineId: EngineId;
  mentioned: boolean;
  position: number | null; // rank among brands in the answer
  sentiment: Sentiment;
  snippet: string;
  citedSources: string[];
}

export interface Prompt {
  id: string;
  text: string;
  category: PromptCategory;
  intent: "commercial" | "informational" | "transactional";
  volumeScore: number; // 0-100 estimated ask frequency
  mentionRate: number; // % across engines & runs
  avgPosition: number | null;
  sentiment: Sentiment;
  trend: number;
  lastScanned: string;
  results: EngineResult[];
}

export const PROMPTS: Prompt[] = [
  {
    id: "p-001",
    text: "What is the best OTT streaming service in 2026?",
    category: "Best-of list",
    intent: "commercial",
    volumeScore: 92,
    mentionRate: 60,
    avgPosition: 3.2,
    sentiment: "positive",
    trend: 8.4,
    lastScanned: "2026-07-14T09:12:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: true,
        position: 3,
        sentiment: "positive",
        snippet:
          "…For cord-cutters who want strong originals and personalized discovery, Streamora stands out, though its catalog is smaller than Netflix's…",
        citedSources: ["rottentomatoes.com", "streamora.com/blog", "techradar.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…Streamora is frequently recommended for U.S. streaming households thanks to its recommendation engine and transparent Standard vs Premium pricing…",
        citedSources: ["streamora.com/pricing", "variety.com", "reddit.com/r/cordcutters"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 4,
        sentiment: "neutral",
        snippet:
          "…Other options worth evaluating include Streamora, which focuses on originals and personalized discovery…",
        citedSources: ["techradar.com", "pcmag.com"],
      },
      {
        engineId: "gemini",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…Top picks include Netflix, Amazon Prime Video, Hulu, and Disney+ depending on content preferences and budget…",
        citedSources: ["forbes.com", "disneyplus.com"],
      },
      {
        engineId: "copilot",
        mentioned: true,
        position: 5,
        sentiment: "neutral",
        snippet:
          "…newer entrants like Streamora and Max offer prestige originals with modern interfaces…",
        citedSources: ["pcmag.com", "max.com"],
      },
    ],
  },
  {
    id: "p-002",
    text: "Streamora vs Netflix: which is better for a streaming household?",
    category: "Comparison",
    intent: "commercial",
    volumeScore: 71,
    mentionRate: 100,
    avgPosition: 1.5,
    sentiment: "positive",
    trend: 4.1,
    lastScanned: "2026-07-14T09:14:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Streamora wins on personalized discovery and Premium plan value; Netflix wins on catalog breadth and global originals volume…",
        citedSources: ["streamora.com/compare/netflix", "variety.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…At Premium pricing, Streamora is roughly 20% cheaper than Netflix's top tier with comparable 4K and downloads…",
        citedSources: ["streamora.com/pricing", "netflix.com/tudum", "reddit.com/r/cordcutters"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…Netflix offers the safer, broader library; Streamora offers stronger recommendation quality for households that binge originals…",
        citedSources: ["techradar.com", "pcmag.com"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 2,
        sentiment: "neutral",
        snippet:
          "…Both are viable; Streamora is newer with fewer third-party channels but ships better personalization controls…",
        citedSources: ["forbes.com"],
      },
      {
        engineId: "copilot",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…for a U.S. cord-cutting household Streamora is often the better value, while Netflix suits viewers who want the widest catalog…",
        citedSources: ["streamora.com/compare/netflix", "pcmag.com"],
      },
    ],
  },
  {
    id: "p-003",
    text: "Best streaming platforms with original series in 2026",
    category: "Best-of list",
    intent: "commercial",
    volumeScore: 88,
    mentionRate: 80,
    avgPosition: 2.0,
    sentiment: "positive",
    trend: 11.2,
    lastScanned: "2026-07-14T09:15:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…Streamora ranks among the strongest originals-focused platforms, with award-friendly dramas and tightly curated comedy slates…",
        citedSources: ["streamora.com/blog/originals-guide", "hollywood.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Streamora tops several 2026 OTT originals roundups thanks to its slate density and discovery algorithms…",
        citedSources: ["variety.com", "streamora.com/blog", "hollywood.com"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…Max and Streamora lead the prestige originals conversation outside Netflix…",
        citedSources: ["max.com", "streamora.com"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 3,
        sentiment: "neutral",
        snippet:
          "…Netflix and Disney+ are established options; Streamora is a notable originals challenger…",
        citedSources: ["forbes.com", "disneyplus.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…leading originals platforms include Netflix, Max, Disney+, and Amazon Prime Video…",
        citedSources: ["netflix.com", "max.com"],
      },
    ],
  },
  {
    id: "p-004",
    text: "How much does Streamora cost per month?",
    category: "Pricing",
    intent: "transactional",
    volumeScore: 54,
    mentionRate: 100,
    avgPosition: 1.0,
    sentiment: "neutral",
    trend: 0.6,
    lastScanned: "2026-07-14T09:17:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: true,
        position: 1,
        sentiment: "neutral",
        snippet:
          "…Streamora Standard is $12.99/month; Streamora Premium with 4K and more streams is $18.99/month…",
        citedSources: ["streamora.com/pricing"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "neutral",
        snippet:
          "…Pricing starts at $12.99 per month for Standard. A 7-day free trial is available on both plans…",
        citedSources: ["streamora.com/pricing", "techradar.com"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 1,
        sentiment: "neutral",
        snippet:
          "…Published pricing: Standard $12.99/mo, Premium $18.99/mo, annual billing saves two months…",
        citedSources: ["streamora.com/pricing"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 1,
        sentiment: "negative",
        snippet:
          "…Streamora pricing appears to start around $12.99/month, though some sources cite outdated 2024 pricing of $9.99…",
        citedSources: ["techradar.com", "cnet.com"],
      },
      {
        engineId: "copilot",
        mentioned: true,
        position: 1,
        sentiment: "neutral",
        snippet:
          "…Streamora offers tiered monthly pricing beginning at $12.99 for Standard with annual discounts…",
        citedSources: ["streamora.com/pricing"],
      },
    ],
  },
  {
    id: "p-005",
    text: "Netflix alternatives for cord-cutters",
    category: "Alternatives",
    intent: "commercial",
    volumeScore: 83,
    mentionRate: 40,
    avgPosition: 4.5,
    sentiment: "neutral",
    trend: 2.3,
    lastScanned: "2026-07-14T09:18:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…Popular Netflix alternatives for cord-cutters include Hulu, Disney+, Max, and Amazon Prime Video…",
        citedSources: ["techradar.com", "max.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 4,
        sentiment: "positive",
        snippet:
          "…Streamora is a strong Netflix alternative for cord-cutters who want originals without the full Netflix price…",
        citedSources: ["reddit.com/r/cordcutters", "streamora.com"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 5,
        sentiment: "neutral",
        snippet:
          "…Also consider Streamora, a newer premium option with household-friendly pricing…",
        citedSources: ["pcmag.com"],
      },
      {
        engineId: "gemini",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…Top alternatives: Hulu, Disney+, Max, and Peacock…",
        citedSources: ["forbes.com", "disneyplus.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…Hulu, Disney+, and Max are commonly recommended Netflix alternatives for U.S. households…",
        citedSources: ["pcmag.com"],
      },
    ],
  },
  {
    id: "p-006",
    text: "Best streaming service for kids profiles and parental controls",
    category: "Use case",
    intent: "commercial",
    volumeScore: 47,
    mentionRate: 80,
    avgPosition: 1.8,
    sentiment: "positive",
    trend: 6.7,
    lastScanned: "2026-07-13T18:40:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Streamora includes PIN-locked kids profiles and age-gated discovery without requiring a separate app…",
        citedSources: ["streamora.com/features/kids", "commonsensemedia.org"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Streamora and Disney+ both ship strong kids profiles; Streamora adds personalized safe-mode recommendations on Premium…",
        citedSources: ["streamora.com/features/kids", "disneyplus.com"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…For kids profiles, look at Disney+ and Streamora; both avoid burying parental controls in settings…",
        citedSources: ["reddit.com/r/cordcutters"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 3,
        sentiment: "neutral",
        snippet:
          "…options include Disney+, Netflix kids profiles, and Streamora's household controls…",
        citedSources: ["disneyplus.com", "netflix.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…Disney+ and Netflix are the most common picks for family profiles…",
        citedSources: ["disneyplus.com", "netflix.com"],
      },
    ],
  },
  {
    id: "p-007",
    text: "How to cancel Netflix and switch to another streaming service",
    category: "How-to",
    intent: "informational",
    volumeScore: 39,
    mentionRate: 20,
    avgPosition: 6.0,
    sentiment: "neutral",
    trend: -1.2,
    lastScanned: "2026-07-13T18:42:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…Cancel via Account → Membership, then start a trial on Hulu or Disney+ if you want next-day TV or family content…",
        citedSources: ["netflix.com/help", "hulu.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 6,
        sentiment: "neutral",
        snippet:
          "…Several services offer switcher promos, including Hulu and Streamora's migration guide for cord-cutters…",
        citedSources: ["streamora.com/switch", "netflix.com/help"],
      },
      {
        engineId: "claude",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…cancel Netflix first, then compare catalog overlap before starting a new subscription…",
        citedSources: ["netflix.com/help"],
      },
      {
        engineId: "gemini",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…use Netflix's cancel flow then the destination service's signup wizard…",
        citedSources: ["netflix.com/help", "techradar.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…third-party comparison sites can help map which shows move to which platform…",
        citedSources: ["justwatch.com"],
      },
    ],
  },
  {
    id: "p-008",
    text: "Best streaming platforms with live sports in the US",
    category: "Use case",
    intent: "commercial",
    volumeScore: 65,
    mentionRate: 60,
    avgPosition: 2.7,
    sentiment: "positive",
    trend: 5.9,
    lastScanned: "2026-07-13T18:45:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: true,
        position: 3,
        sentiment: "positive",
        snippet:
          "…Streamora's Premium plan adds select live sports windows that make it a fit for casual sports households…",
        citedSources: ["streamora.com/blog/live-sports", "espn.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…For live sports, Hulu + Live TV and Streamora Premium are frequently compared for cord-cutters who want games plus on-demand…",
        citedSources: ["streamora.com", "hulu.com", "reddit.com/r/cordcutters"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 3,
        sentiment: "neutral",
        snippet:
          "…consider Hulu + Live TV, YouTube TV, or Streamora Premium depending on which leagues you watch…",
        citedSources: ["pcmag.com"],
      },
      {
        engineId: "gemini",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…Hulu + Live TV, YouTube TV, and Amazon Prime Video sports add-ons are common choices…",
        citedSources: ["hulu.com", "amazon.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…popular options include Hulu + Live TV, YouTube TV, and ESPN streaming packages…",
        citedSources: ["espn.com", "pcmag.com"],
      },
    ],
  },
  {
    id: "p-009",
    text: "Streamora reviews and complaints",
    category: "Comparison",
    intent: "informational",
    volumeScore: 42,
    mentionRate: 100,
    avgPosition: 1.0,
    sentiment: "positive",
    trend: 1.8,
    lastScanned: "2026-07-12T11:02:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Streamora holds a 4.6/5 on major review aggregators. Praise centers on discovery and originals; complaints mention a smaller back catalog…",
        citedSources: ["trustpilot.com", "reddit.com/r/cordcutters"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Reviewers consistently highlight personalized recommendations. The most common complaint is limited international catalog depth…",
        citedSources: ["trustpilot.com", "reddit.com/r/cordcutters", "techradar.com"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Overall sentiment is positive; recent reviews note improved kids profiles after the Q2 2026 update…",
        citedSources: ["trustpilot.com", "commonsensemedia.org"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 1,
        sentiment: "neutral",
        snippet:
          "…Mixed-to-positive reviews; some users report a learning curve for profile switching…",
        citedSources: ["cnet.com", "techradar.com"],
      },
      {
        engineId: "copilot",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Generally favorable reviews with a 4.5+ average across major review platforms…",
        citedSources: ["trustpilot.com", "pcmag.com"],
      },
    ],
  },
  {
    id: "p-010",
    text: "Cheapest premium streaming service with 4K",
    category: "Pricing",
    intent: "commercial",
    volumeScore: 58,
    mentionRate: 20,
    avgPosition: 5.0,
    sentiment: "neutral",
    trend: -2.6,
    lastScanned: "2026-07-12T11:05:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…budget 4K picks include Disney+ with ads, Peacock Premium Plus, and Hulu's ad-supported tier…",
        citedSources: ["disneyplus.com", "hulu.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 5,
        sentiment: "neutral",
        snippet:
          "…if budget allows slightly more, Streamora Premium at $18.99 includes 4K and downloads that cost extra elsewhere…",
        citedSources: ["streamora.com/pricing", "techradar.com"],
      },
      {
        engineId: "claude",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…Disney+ and Peacock are the usual budget recommendations for 4K…",
        citedSources: ["disneyplus.com", "pcmag.com"],
      },
      {
        engineId: "gemini",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…Disney+, Peacock, and Paramount+ lead on price for 4K…",
        citedSources: ["forbes.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…consider Disney+ or Hulu with ads if 4K is optional…",
        citedSources: ["disneyplus.com", "pcmag.com"],
      },
    ],
  },
  {
    id: "p-011",
    text: "Does Streamora support offline downloads and multiple profiles?",
    category: "How-to",
    intent: "informational",
    volumeScore: 33,
    mentionRate: 100,
    avgPosition: 1.0,
    sentiment: "positive",
    trend: 0.4,
    lastScanned: "2026-07-11T15:20:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Yes. Streamora supports offline downloads on Premium and up to 5 profiles on both Standard and Premium…",
        citedSources: ["streamora.com/features"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Downloads are Premium-only; profiles and personalized queues are included on all plans…",
        citedSources: ["streamora.com/features", "streamora.com/help"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet: "…Native offline downloads + multi-profile support confirmed in Streamora's help center…",
        citedSources: ["streamora.com/help"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 1,
        sentiment: "neutral",
        snippet: "…Offline downloads and household profiles are listed in Streamora's feature matrix…",
        citedSources: ["streamora.com/features"],
      },
      {
        engineId: "copilot",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet: "…Yes, both are supported along with simultaneous streams on Premium…",
        citedSources: ["streamora.com/features"],
      },
    ],
  },
  {
    id: "p-012",
    text: "Disney+ alternatives with better personalized discovery",
    category: "Alternatives",
    intent: "commercial",
    volumeScore: 76,
    mentionRate: 80,
    avgPosition: 1.5,
    sentiment: "positive",
    trend: 9.3,
    lastScanned: "2026-07-11T15:24:00Z",
    results: [
      {
        engineId: "chatgpt",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Streamora is the most-cited discovery-forward Disney+ alternative, with stronger taste profiles and fewer franchise-first carousels…",
        citedSources: ["streamora.com/compare/disney", "variety.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Top discovery-first alternatives: Streamora, Netflix, and Max. Streamora leads on explainable recommendations…",
        citedSources: ["variety.com", "streamora.com", "max.com"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…Netflix and Streamora are the strongest options if personalized discovery is the priority…",
        citedSources: ["netflix.com", "streamora.com"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 2,
        sentiment: "neutral",
        snippet:
          "…consider Netflix, Streamora, or Amazon Prime Video depending on catalog needs…",
        citedSources: ["netflix.com", "primevideo.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…Netflix and Max are the main discovery-heavy alternatives to Disney+…",
        citedSources: ["netflix.com", "max.com"],
      },
    ],
  },
];

export interface ScanRecord {
  id: string;
  date: string;
  promptCount: number;
  engines: EngineId[];
  mentionRate: number;
  avgPosition: number;
  visibilityScore: number;
  delta: number;
  status: "complete" | "partial";
  triggeredBy: "schedule" | "manual";
}

export const SCAN_HISTORY: ScanRecord[] = [
  { id: "scan-024", date: "2026-07-14T09:00:00Z", promptCount: 12, engines: ["chatgpt", "claude", "perplexity", "gemini", "copilot"], mentionRate: 49, avgPosition: 2.8, visibilityScore: 52, delta: 3, status: "complete", triggeredBy: "schedule" },
  { id: "scan-023", date: "2026-07-07T09:00:00Z", promptCount: 12, engines: ["chatgpt", "claude", "perplexity", "gemini", "copilot"], mentionRate: 47, avgPosition: 2.9, visibilityScore: 49, delta: 2, status: "complete", triggeredBy: "schedule" },
  { id: "scan-022", date: "2026-07-02T14:31:00Z", promptCount: 12, engines: ["chatgpt", "perplexity"], mentionRate: 55, avgPosition: 2.5, visibilityScore: 48, delta: 1, status: "partial", triggeredBy: "manual" },
  { id: "scan-021", date: "2026-06-30T09:00:00Z", promptCount: 12, engines: ["chatgpt", "claude", "perplexity", "gemini", "copilot"], mentionRate: 46, avgPosition: 3.0, visibilityScore: 47, delta: 2, status: "complete", triggeredBy: "schedule" },
  { id: "scan-020", date: "2026-06-23T09:00:00Z", promptCount: 11, engines: ["chatgpt", "claude", "perplexity", "gemini", "copilot"], mentionRate: 44, avgPosition: 3.1, visibilityScore: 45, delta: 2, status: "complete", triggeredBy: "schedule" },
  { id: "scan-019", date: "2026-06-16T09:00:00Z", promptCount: 11, engines: ["chatgpt", "claude", "perplexity", "gemini", "copilot"], mentionRate: 43, avgPosition: 3.1, visibilityScore: 43, delta: 2, status: "complete", triggeredBy: "schedule" },
  { id: "scan-018", date: "2026-06-09T09:00:00Z", promptCount: 11, engines: ["chatgpt", "claude", "perplexity", "gemini", "copilot"], mentionRate: 42, avgPosition: 3.2, visibilityScore: 41, delta: 4, status: "complete", triggeredBy: "schedule" },
  { id: "scan-017", date: "2026-06-02T09:00:00Z", promptCount: 10, engines: ["chatgpt", "claude", "perplexity", "gemini", "copilot"], mentionRate: 39, avgPosition: 3.4, visibilityScore: 37, delta: -1, status: "complete", triggeredBy: "schedule" },
  { id: "scan-016", date: "2026-05-26T09:00:00Z", promptCount: 10, engines: ["chatgpt", "claude", "perplexity", "gemini", "copilot"], mentionRate: 40, avgPosition: 3.3, visibilityScore: 38, delta: 2, status: "complete", triggeredBy: "schedule" },
  { id: "scan-015", date: "2026-05-19T09:00:00Z", promptCount: 10, engines: ["chatgpt", "claude", "perplexity", "gemini", "copilot"], mentionRate: 38, avgPosition: 3.5, visibilityScore: 36, delta: 4, status: "complete", triggeredBy: "schedule" },
  { id: "scan-014", date: "2026-05-12T09:00:00Z", promptCount: 10, engines: ["chatgpt", "claude", "perplexity", "gemini"], mentionRate: 35, avgPosition: 3.6, visibilityScore: 32, delta: -1, status: "partial", triggeredBy: "schedule" },
  { id: "scan-013", date: "2026-05-05T09:00:00Z", promptCount: 10, engines: ["chatgpt", "claude", "perplexity", "gemini", "copilot"], mentionRate: 36, avgPosition: 3.6, visibilityScore: 33, delta: 2, status: "complete", triggeredBy: "schedule" },
];

export interface EntityNode {
  id: string;
  label: string;
  type: "brand" | "feature" | "category" | "audience" | "competitor" | "source";
  strength: number; // 0-100 association strength with Streamora in AI answers
  trend: number;
  description: string;
}

export interface EntityEdge {
  source: string;
  target: string;
  weight: number; // 0-1
}

export const ENTITY_NODES: EntityNode[] = [
  { id: "streamora", label: "Streamora", type: "brand", strength: 100, trend: 0, description: "The tracked brand." },
  { id: "ott-streaming", label: "OTT streaming", type: "category", strength: 86, trend: 9.1, description: "Strongest category association. Appears in 71% of answers that mention Streamora." },
  { id: "originals", label: "Original series", type: "feature", strength: 74, trend: 7.4, description: "Feature most often credited to Streamora in AI answers." },
  { id: "discovery", label: "Personalized discovery", type: "feature", strength: 69, trend: 5.2, description: "Recommendation quality is a recurring differentiator vs Netflix/Hulu." },
  { id: "cord-cutters", label: "Cord-cutters", type: "audience", strength: 64, trend: 3.8, description: "Primary audience engines associate with Streamora." },
  { id: "kids-profiles", label: "Kids profiles", type: "feature", strength: 61, trend: 2.9, description: "Frequently mentioned alongside parental controls." },
  { id: "households", label: "Streaming households", type: "audience", strength: 43, trend: 6.6, description: "Emerging association driven by recent household-plan content." },
  { id: "streaming-cat", label: "Streaming video", type: "category", strength: 58, trend: 1.2, description: "Broad category association — weaker than niche categories." },
  { id: "max", label: "Max", type: "competitor", strength: 52, trend: 4.4, description: "Most co-mentioned competitor (usually framed as peers on originals)." },
  { id: "netflix", label: "Netflix", type: "competitor", strength: 48, trend: 1.9, description: "Co-mentioned in comparison prompts; usually framed as the incumbent." },
  { id: "variety", label: "Variety coverage", type: "source", strength: 66, trend: 2.4, description: "Most influential third-party citation source for Streamora answers." },
  { id: "reddit", label: "Reddit threads", type: "source", strength: 45, trend: 8.2, description: "Fast-growing citation source, especially on Perplexity." },
  { id: "streamora-blog", label: "streamora.com blog", type: "source", strength: 59, trend: 6.1, description: "Owned content cited in 31% of Streamora mentions." },
  { id: "live-sports", label: "Live sports", type: "feature", strength: 39, trend: 3.3, description: "Under-associated relative to Premium plan strength — an opportunity." },
];

export const ENTITY_EDGES: EntityEdge[] = [
  { source: "streamora", target: "ott-streaming", weight: 0.86 },
  { source: "streamora", target: "originals", weight: 0.74 },
  { source: "streamora", target: "discovery", weight: 0.69 },
  { source: "streamora", target: "cord-cutters", weight: 0.64 },
  { source: "streamora", target: "kids-profiles", weight: 0.61 },
  { source: "streamora", target: "streaming-cat", weight: 0.58 },
  { source: "streamora", target: "households", weight: 0.43 },
  { source: "streamora", target: "max", weight: 0.52 },
  { source: "streamora", target: "netflix", weight: 0.48 },
  { source: "streamora", target: "variety", weight: 0.66 },
  { source: "streamora", target: "reddit", weight: 0.45 },
  { source: "streamora", target: "streamora-blog", weight: 0.59 },
  { source: "streamora", target: "live-sports", weight: 0.39 },
  { source: "ott-streaming", target: "max", weight: 0.55 },
  { source: "discovery", target: "max", weight: 0.41 },
  { source: "streaming-cat", target: "netflix", weight: 0.72 },
  { source: "variety", target: "netflix", weight: 0.5 },
];

export type OpportunityCategory =
  | "Content"
  | "Technical SEO"
  | "Structured Data"
  | "Knowledge Graph"
  | "Authority"
  | "Brand Positioning"
  | "Comparisons"
  | "FAQ"
  | "Schema"
  | "Citations";

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  category: OpportunityCategory;
  status: "new" | "in-progress" | "done";
  estimatedLift: string;
  relatedPromptIds: string[];
  actions: string[];
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-001",
    title: "Improve AEO visibility on Gemini best-of prompts",
    description:
      "Gemini omits Streamora from most “best OTT” answers. Closing this AEO gap means earning citations on the listicles Gemini trusts and publishing extractable comparison content engines can quote.",
    impact: "high",
    effort: "medium",
    category: "Authority",
    status: "new",
    estimatedLift: "+8–12 pp AI mention rate on Gemini",
    relatedPromptIds: ["p-001", "p-005", "p-010"],
    actions: [
      "Earn placement on Forbes Advisor / TechRadar streaming roundups that Gemini cites",
      "Publish an answer-ready comparison hub with clear H2 questions and short quotable paragraphs",
      "Refresh Trustpilot/CNET profiles so third-party AEO citations stay accurate",
    ],
  },
  {
    id: "opp-002",
    title: "Fix stale facts that hurt answer-engine trust",
    description:
      "Gemini still cites outdated pricing. Inconsistent product facts reduce recommendation confidence and create negative framing in AEO answers.",
    impact: "high",
    effort: "low",
    category: "Technical SEO",
    status: "in-progress",
    estimatedLift: "Removes negative sentiment on pricing prompts",
    relatedPromptIds: ["p-004"],
    actions: [
      "Sync canonical pricing across site, TechRadar, and CNET",
      "Add Product + Offer schema on the pricing page",
      "Publish an llms.txt fact file so crawlers prefer owned sources",
    ],
  },
  {
    id: "opp-003",
    title: "Win high-intent AEO comparison & alternatives prompts",
    description:
      "“Netflix alternatives” and head-to-head prompts drive commercial AI recommendations. Competitors dominate these answers; Streamora needs stronger comparison coverage to improve AEO visibility.",
    impact: "high",
    effort: "medium",
    category: "Comparisons",
    status: "new",
    estimatedLift: "+15 pp mention rate on alternatives prompts",
    relatedPromptIds: ["p-005", "p-012"],
    actions: [
      "Ship Streamora vs Netflix / Disney+ pages with switcher CTAs",
      "Add comparison tables engines can lift into answers",
      "Seed credible third-party discussions that Perplexity can cite",
    ],
  },
  {
    id: "opp-004",
    title: "Strengthen entity associations for live sports",
    description:
      "Answer engines weakly associate Streamora with live sports despite it being a Premium capability. Stronger entity relationships improve how models describe and recommend the brand.",
    impact: "medium",
    effort: "low",
    category: "Knowledge Graph",
    status: "new",
    estimatedLift: "+20 entity strength for live sports",
    relatedPromptIds: ["p-003", "p-008"],
    actions: [
      "Publish a live-sports coverage calendar with methodology and stats",
      "Connect Product → Feature entities in schema and copy",
      "Repeat “live sports for cord-cutters” phrasing on homepage and help docs",
    ],
  },
  {
    id: "opp-005",
    title: "Build citation authority for Perplexity AEO wins",
    description:
      "Perplexity visibility tracks community and review citations. Growing authoritative, linkable proof points increases how often Streamora is recommended in sourced answers.",
    impact: "medium",
    effort: "medium",
    category: "Citations",
    status: "new",
    estimatedLift: "+5 pp Perplexity mention rate",
    relatedPromptIds: ["p-005", "p-008", "p-009"],
    actions: [
      "Create cite-worthy docs (limits, pricing, sports windows) people naturally link",
      "Earn independent reviews with clear product positioning",
      "Monitor cord-cutter threads and contribute useful, non-spammy answers",
    ],
  },
  {
    id: "opp-006",
    title: "Unblock answer-engine crawlers (AEO technical baseline)",
    description:
      "If GPTBot/ClaudeBot/PerplexityBot can’t reliably fetch owned pages, models lean on competitors’ sources. Crawler access is foundational AEO hygiene.",
    impact: "medium",
    effort: "low",
    category: "Technical SEO",
    status: "done",
    estimatedLift: "+31% owned-source citations (measured)",
    relatedPromptIds: ["p-004", "p-011"],
    actions: [
      "Allow major answer-engine bots in robots.txt",
      "Publish llms.txt with canonical product facts",
      "Add FAQPage schema on help and pricing",
    ],
  },
  {
    id: "opp-007",
    title: "Capture switch-intent AEO prompts with migration FAQs",
    description:
      "Cancel-and-switch how-tos are high-intent moments in AI answers. Expanding FAQ and how-to content improves inclusion when users ask how to leave Netflix/Hulu/Disney+.",
    impact: "low",
    effort: "high",
    category: "FAQ",
    status: "new",
    estimatedLift: "+10 pp on migration prompts",
    relatedPromptIds: ["p-007"],
    actions: [
      "Publish step-by-step switcher guides as FAQ-structured pages",
      "Add HowTo + FAQ schema for each switch path",
      "Link guides from pricing and comparison pages for internal authority",
    ],
  },
  {
    id: "opp-008",
    title: "Add answer-extractable snippets on key landing pages",
    description:
      "Models prefer short, self-contained paragraphs that directly answer viewer questions. Improving snippet readiness raises the chance Streamora is quoted in AI answers.",
    impact: "high",
    effort: "medium",
    category: "Content",
    status: "new",
    estimatedLift: "+6–9 pp share of recommendations",
    relatedPromptIds: ["p-001", "p-003", "p-006"],
    actions: [
      "Rewrite hero sections into 40–60 word answer blobs",
      "Add question-based H2s that match tracked prompts",
      "Include one statistic with a primary-source citation on each page",
    ],
  },
];

export interface Report {
  id: string;
  title: string;
  period: string;
  createdAt: string;
  type: "Weekly digest" | "Monthly deep-dive" | "Competitor alert" | "Custom";
  status: "ready" | "generating";
  highlights: string[];
}

export const REPORTS: Report[] = [
  {
    id: "rep-009",
    title: "Weekly AEO digest — Jul 7 to Jul 13",
    period: "Jul 7 – Jul 13, 2026",
    createdAt: "2026-07-14T10:00:00Z",
    type: "Weekly digest",
    status: "ready",
    highlights: [
      "Visibility score up 3 points to 52 — best week on record",
      "Perplexity mention rate crossed 60% for the first time",
      "Gemini remains the weakest engine (41%, down 1.4 pp)",
    ],
  },
  {
    id: "rep-008",
    title: "Competitor alert: Max momentum",
    period: "Jul 10, 2026",
    createdAt: "2026-07-10T16:22:00Z",
    type: "Competitor alert",
    status: "ready",
    highlights: [
      "Max share of voice up 2.7 pp in two weeks",
      "New Variety coverage cited across ChatGPT and Claude",
      "Max now co-mentioned with Streamora in 52% of originals prompts",
    ],
  },
  {
    id: "rep-007",
    title: "June 2026 deep-dive",
    period: "Jun 1 – Jun 30, 2026",
    createdAt: "2026-07-01T09:00:00Z",
    type: "Monthly deep-dive",
    status: "ready",
    highlights: [
      "Visibility score climbed from 37 to 47 over the month",
      "llms.txt rollout lifted owned-source citations by 31%",
      "Pricing prompt sentiment issue identified on Gemini",
    ],
  },
  {
    id: "rep-006",
    title: "Weekly AEO digest — Jun 23 to Jun 29",
    period: "Jun 23 – Jun 29, 2026",
    createdAt: "2026-06-30T10:00:00Z",
    type: "Weekly digest",
    status: "ready",
    highlights: [
      "Mention rate steady at 46%",
      "Two new prompts added to tracking set",
      "Reddit citations up 14% week over week",
    ],
  },
  {
    id: "rep-005",
    title: "Custom: Board metrics pack Q2",
    period: "Apr 1 – Jun 30, 2026",
    createdAt: "2026-06-28T14:45:00Z",
    type: "Custom",
    status: "ready",
    highlights: [
      "Q2 visibility score +16 points (31 → 47)",
      "Share of voice rank improved from #6 to #4",
      "AI-sourced trial signups estimated at 210 for the quarter",
    ],
  },
];

export const DASHBOARD_STATS = {
  visibilityScore: 52,
  visibilityDelta: 3,
  mentionRate: 49,
  mentionRateDelta: 2.4,
  avgPosition: 2.8,
  avgPositionDelta: -0.2, // negative = improved
  shareOfVoice: 12.2,
  shareOfVoiceDelta: 1.1,
  trackedPrompts: 12,
  enginesTracked: 5,
  lastScan: "2026-07-14T09:00:00Z",
};

export interface ActivityItem {
  id: string;
  type: "scan" | "alert" | "opportunity" | "report" | "change";
  title: string;
  detail: string;
  time: string;
}

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "a1", type: "scan", title: "Weekly scan completed", detail: "12 prompts across 5 engines — visibility 52 (+3)", time: "2026-07-14T09:12:00Z" },
  { id: "a2", type: "change", title: "Position improved on ChatGPT", detail: "\u201cBest streaming platforms with original series\u201d moved from #3 to #2", time: "2026-07-14T09:12:00Z" },
  { id: "a3", type: "alert", title: "Gemini citing outdated pricing", detail: "2024 pricing surfaced from a stale TechRadar listing", time: "2026-07-13T17:40:00Z" },
  { id: "a4", type: "opportunity", title: "New opportunity identified", detail: "Close the Gemini visibility gap on best-of prompts", time: "2026-07-13T17:38:00Z" },
  { id: "a5", type: "report", title: "Weekly digest ready", detail: "Jul 7 – Jul 13 digest generated", time: "2026-07-14T10:00:00Z" },
  { id: "a6", type: "change", title: "New citation detected", detail: "variety.com now cites streamora.com on originals prompts", time: "2026-07-12T08:15:00Z" },
];

export const SENTIMENT_BREAKDOWN = [
  { name: "Positive", value: 58, color: "#34d399" },
  { name: "Neutral", value: 34, color: "#8b8b9e" },
  { name: "Negative", value: 8, color: "#f87171" },
];

export const CITATION_SOURCES = [
  { source: "variety.com", citations: 148, share: 21.4, trend: 2.1, owned: false },
  { source: "streamora.com", citations: 132, share: 19.1, trend: 6.4, owned: true },
  { source: "reddit.com", citations: 87, share: 12.6, trend: 8.2, owned: false },
  { source: "techradar.com", citations: 74, share: 10.7, trend: -1.3, owned: false },
  { source: "rottentomatoes.com", citations: 52, share: 7.5, trend: 0.8, owned: false },
  { source: "trustpilot.com", citations: 41, share: 5.9, trend: 1.7, owned: false },
  { source: "forbes.com", citations: 38, share: 5.5, trend: -0.4, owned: false },
  { source: "hollywoodreporter.com", citations: 22, share: 3.2, trend: 4.9, owned: false },
];

// Content Optimizer sample analysis
export const OPTIMIZER_SAMPLE = {
  url: "streamora.com/blog/originals-guide",
  score: 68,
  checks: [
    { id: "c1", label: "Direct answer in first 100 words", status: "pass" as const, detail: "The opening paragraph directly defines premium OTT originals — engines can lift it as a snippet." },
    { id: "c2", label: "Question-based H2/H3 headings", status: "pass" as const, detail: "7 of 9 headings are phrased as questions matching tracked prompts." },
    { id: "c3", label: "FAQ schema markup", status: "fail" as const, detail: "No FAQPage structured data found. Add schema for the 6 FAQ items at the bottom of the page." },
    { id: "c4", label: "Statistics with citable sources", status: "warn" as const, detail: "4 statistics lack linked sources. Engines prefer verifiable claims." },
    { id: "c5", label: "Comparison table present", status: "pass" as const, detail: "The feature comparison table is well-structured with <table> markup." },
    { id: "c6", label: "Freshness signal", status: "warn" as const, detail: "Last-modified date is 94 days old. Refresh with 2026 data and update dateModified." },
    { id: "c7", label: "Entity clarity", status: "pass" as const, detail: "Streamora is consistently referenced with category context (\u201cpremium OTT streaming\u201d)." },
    { id: "c8", label: "Crawler accessibility", status: "pass" as const, detail: "Page is accessible to GPTBot, ClaudeBot, and PerplexityBot." },
    { id: "c9", label: "Standalone extractable paragraphs", status: "fail" as const, detail: "3 key sections depend on surrounding context and can't be quoted standalone." },
  ],
  suggestions: [
    {
      title: "Add an FAQ block with schema",
      before: "The page ends with a generic conclusion paragraph.",
      after:
        "Append 6 Q&A pairs mirroring tracked prompts (\u201cHow much does Streamora cost?\u201d, \u201cWhat is the best OTT for cord-cutters?\u201d) wrapped in FAQPage JSON-LD.",
      impact: "high" as const,
    },
    {
      title: "Make the pricing claim self-contained",
      before: "\u201cAs mentioned above, our Standard plan is affordable for most households.\u201d",
      after:
        "\u201cStreamora Standard costs $12.99 per month, which includes personalized discovery and kids profiles; Premium is $18.99 with 4K and downloads.\u201d",
      impact: "high" as const,
    },
    {
      title: "Attach sources to statistics",
      before: "\u201cHouseholds using personalized discovery watch 23% more originals.\u201d",
      after:
        "\u201cHouseholds using personalized discovery watch 23% more originals, according to Streamora's 2026 Viewing Benchmark of 1,400 U.S. households [link].\u201d",
      impact: "medium" as const,
    },
    {
      title: "Refresh dateModified and update 2025 references",
      before: "Article references \u201cas of early 2025\u201d in three places.",
      after: "Update all references to 2026, republish, and update the dateModified structured data field.",
      impact: "medium" as const,
    },
  ],
};

export const ENGINE_LOOKUP: Record<EngineId, Engine> = Object.fromEntries(
  ENGINES.map((e) => [e.id, e])
) as Record<EngineId, Engine>;

export function getPromptById(id: string): Prompt | undefined {
  return PROMPTS.find((p) => p.id === id);
}
