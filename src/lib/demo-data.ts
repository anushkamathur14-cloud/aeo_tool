// Static demo dataset for BrandSignal — AEO (Answer Engine Optimization)
// analytics for the fictional brand "NovaCRM".

export const BRAND = {
  name: "NovaCRM",
  domain: "novacrm.io",
  description:
    "AI-native CRM for mid-market B2B teams. Pipeline automation, revenue intelligence, and a built-in data enrichment layer.",
  category: "CRM software",
};

export type EngineId = "chatgpt" | "claude" | "perplexity" | "gemini" | "copilot";

export interface Engine {
  id: EngineId;
  name: string;
  vendor: string;
  color: string;
  mentionRate: number; // % of tracked prompts where NovaCRM is mentioned
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
    id: "hubspot",
    name: "HubSpot",
    domain: "hubspot.com",
    shareOfVoice: 27.4,
    mentionRate: 91,
    avgPosition: 1.3,
    trend: -0.8,
    sentiment: 81,
    strongestEngine: "chatgpt",
    note: "Dominates broad 'best CRM' prompts on every engine. Weakest on pricing-sensitive queries.",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    domain: "salesforce.com",
    shareOfVoice: 24.1,
    mentionRate: 88,
    avgPosition: 1.7,
    trend: -1.6,
    sentiment: 72,
    strongestEngine: "gemini",
    note: "Cited as the enterprise default. Frequently flagged for complexity and cost in answers.",
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    domain: "pipedrive.com",
    shareOfVoice: 14.9,
    mentionRate: 74,
    avgPosition: 2.6,
    trend: 1.1,
    sentiment: 84,
    strongestEngine: "perplexity",
    note: "Owns 'simple CRM for small sales teams' positioning. Strong G2 citation footprint.",
  },
  {
    id: "novacrm",
    name: "NovaCRM",
    domain: "novacrm.io",
    shareOfVoice: 12.2,
    mentionRate: 49,
    avgPosition: 2.8,
    trend: 3.4,
    sentiment: 88,
    strongestEngine: "perplexity",
    note: "Rising fast on AI-focused prompts. Under-cited on comparison and pricing queries.",
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    domain: "zoho.com",
    shareOfVoice: 11.8,
    mentionRate: 69,
    avgPosition: 3.1,
    trend: -0.3,
    sentiment: 76,
    strongestEngine: "copilot",
    note: "Wins on budget prompts. Answers often mention the broader Zoho suite as a differentiator.",
  },
  {
    id: "attio",
    name: "Attio",
    domain: "attio.com",
    shareOfVoice: 9.6,
    mentionRate: 44,
    avgPosition: 3.4,
    trend: 2.7,
    sentiment: 86,
    strongestEngine: "claude",
    note: "Closest direct rival on 'modern / AI-native CRM' prompts. Growing citation base from tech blogs.",
  },
];

export interface VisibilityPoint {
  week: string; // ISO date (week start)
  label: string;
  novacrm: number;
  hubspot: number;
  salesforce: number;
  pipedrive: number;
  attio: number;
}

// 12 weeks of visibility score (0-100 composite of mention rate + position)
export const VISIBILITY_TREND: VisibilityPoint[] = [
  { week: "2026-04-27", label: "Apr 27", novacrm: 31, hubspot: 74, salesforce: 71, pipedrive: 52, attio: 27 },
  { week: "2026-05-04", label: "May 4", novacrm: 33, hubspot: 75, salesforce: 70, pipedrive: 53, attio: 28 },
  { week: "2026-05-11", label: "May 11", novacrm: 32, hubspot: 73, salesforce: 71, pipedrive: 51, attio: 30 },
  { week: "2026-05-18", label: "May 18", novacrm: 36, hubspot: 74, salesforce: 69, pipedrive: 52, attio: 31 },
  { week: "2026-05-25", label: "May 25", novacrm: 38, hubspot: 72, salesforce: 68, pipedrive: 54, attio: 30 },
  { week: "2026-06-01", label: "Jun 1", novacrm: 37, hubspot: 73, salesforce: 68, pipedrive: 53, attio: 32 },
  { week: "2026-06-08", label: "Jun 8", novacrm: 41, hubspot: 71, salesforce: 67, pipedrive: 55, attio: 33 },
  { week: "2026-06-15", label: "Jun 15", novacrm: 43, hubspot: 72, salesforce: 66, pipedrive: 54, attio: 35 },
  { week: "2026-06-22", label: "Jun 22", novacrm: 45, hubspot: 70, salesforce: 66, pipedrive: 55, attio: 34 },
  { week: "2026-06-29", label: "Jun 29", novacrm: 47, hubspot: 71, salesforce: 65, pipedrive: 56, attio: 36 },
  { week: "2026-07-06", label: "Jul 6", novacrm: 49, hubspot: 70, salesforce: 65, pipedrive: 55, attio: 37 },
  { week: "2026-07-13", label: "Jul 13", novacrm: 52, hubspot: 69, salesforce: 64, pipedrive: 56, attio: 38 },
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
    text: "What is the best CRM for mid-market B2B companies?",
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
          "…For mid-market teams that want AI-native workflows, NovaCRM stands out with automated pipeline scoring and built-in enrichment, though its ecosystem is smaller than HubSpot's…",
        citedSources: ["g2.com", "novacrm.io/blog", "techradar.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…NovaCRM is frequently recommended for mid-market B2B due to its revenue intelligence features and transparent per-seat pricing…",
        citedSources: ["novacrm.io/pricing", "g2.com", "reddit.com/r/sales"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 4,
        sentiment: "neutral",
        snippet:
          "…Other options worth evaluating include NovaCRM, which focuses on AI-driven automation for B2B pipelines…",
        citedSources: ["capterra.com", "softwareadvice.com"],
      },
      {
        engineId: "gemini",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…Top picks include HubSpot, Salesforce, Pipedrive, and Zoho CRM depending on team size and budget…",
        citedSources: ["forbes.com", "zoho.com"],
      },
      {
        engineId: "copilot",
        mentioned: true,
        position: 5,
        sentiment: "neutral",
        snippet:
          "…newer entrants like NovaCRM and Attio offer modern interfaces with AI features baked in…",
        citedSources: ["pcmag.com", "attio.com"],
      },
    ],
  },
  {
    id: "p-002",
    text: "NovaCRM vs HubSpot: which is better for a 50-person sales team?",
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
          "…NovaCRM wins on automation depth and price-per-seat for a 50-person team; HubSpot wins on marketing suite breadth and integrations…",
        citedSources: ["novacrm.io/compare/hubspot", "g2.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…At 50 seats, NovaCRM's Growth plan is roughly 35% cheaper than HubSpot Sales Hub Professional with comparable automation…",
        citedSources: ["novacrm.io/pricing", "hubspot.com/pricing", "reddit.com/r/sales"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…HubSpot offers the safer, broader platform; NovaCRM offers stronger AI-led pipeline management for sales-led orgs…",
        citedSources: ["g2.com", "capterra.com"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 2,
        sentiment: "neutral",
        snippet:
          "…Both are viable; NovaCRM is newer with fewer third-party integrations but ships native enrichment…",
        citedSources: ["softwareadvice.com"],
      },
      {
        engineId: "copilot",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…for a sales-led 50-person team NovaCRM is often the better value, while HubSpot suits combined sales+marketing motions…",
        citedSources: ["novacrm.io/compare/hubspot", "pcmag.com"],
      },
    ],
  },
  {
    id: "p-003",
    text: "Best AI-powered CRM tools in 2026",
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
          "…NovaCRM ranks among the strongest AI-native CRMs, with lead scoring, forecast modeling, and auto-drafted follow-ups…",
        citedSources: ["novacrm.io/blog/ai-crm-guide", "techcrunch.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…NovaCRM tops several 2026 AI CRM roundups thanks to its embedded revenue-intelligence models…",
        citedSources: ["g2.com", "novacrm.io/blog", "venturebeat.com"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…Attio and NovaCRM lead the new generation of AI-first CRMs…",
        citedSources: ["attio.com", "novacrm.io"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 3,
        sentiment: "neutral",
        snippet:
          "…Salesforce Einstein and HubSpot AI are established options; NovaCRM is a notable AI-native challenger…",
        citedSources: ["forbes.com", "salesforce.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…leading AI CRM options include Salesforce, HubSpot, Zoho with Zia, and Microsoft Dynamics 365 Copilot…",
        citedSources: ["microsoft.com", "zoho.com"],
      },
    ],
  },
  {
    id: "p-004",
    text: "How much does NovaCRM cost per user?",
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
          "…NovaCRM's Growth plan is $49/user/month billed annually; the Scale plan with revenue intelligence is $89/user/month…",
        citedSources: ["novacrm.io/pricing"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "neutral",
        snippet:
          "…Pricing starts at $49 per user per month (annual). A 14-day free trial is available on all plans…",
        citedSources: ["novacrm.io/pricing", "getapp.com"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 1,
        sentiment: "neutral",
        snippet:
          "…Published pricing: Growth $49/user/mo, Scale $89/user/mo, Enterprise custom…",
        citedSources: ["novacrm.io/pricing"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 1,
        sentiment: "negative",
        snippet:
          "…NovaCRM pricing information appears to start around $49/user, though some sources cite outdated 2024 pricing of $39…",
        citedSources: ["capterra.com", "getapp.com"],
      },
      {
        engineId: "copilot",
        mentioned: true,
        position: 1,
        sentiment: "neutral",
        snippet:
          "…NovaCRM offers tiered per-seat pricing beginning at $49/user/month with annual billing…",
        citedSources: ["novacrm.io/pricing"],
      },
    ],
  },
  {
    id: "p-005",
    text: "Salesforce alternatives for startups",
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
          "…Popular Salesforce alternatives for startups include HubSpot, Pipedrive, Zoho CRM, and Attio…",
        citedSources: ["g2.com", "attio.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 4,
        sentiment: "positive",
        snippet:
          "…NovaCRM is a strong Salesforce alternative for startups that want AI features without enterprise complexity…",
        citedSources: ["reddit.com/r/startups", "novacrm.io"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 5,
        sentiment: "neutral",
        snippet:
          "…Also consider NovaCRM, a newer AI-native option with startup-friendly pricing…",
        citedSources: ["capterra.com"],
      },
      {
        engineId: "gemini",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…Top alternatives: HubSpot (free tier), Pipedrive, Zoho CRM, Freshsales…",
        citedSources: ["forbes.com", "zoho.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…HubSpot, Zoho CRM, and Pipedrive are commonly recommended Salesforce alternatives for early-stage companies…",
        citedSources: ["pcmag.com"],
      },
    ],
  },
  {
    id: "p-006",
    text: "CRM with built-in data enrichment",
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
          "…NovaCRM includes native enrichment (firmographics, technographics, contact data) without a third-party add-on…",
        citedSources: ["novacrm.io/features/enrichment", "g2.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…NovaCRM and Attio both ship built-in enrichment; NovaCRM covers 40+ firmographic fields on the Growth plan…",
        citedSources: ["novacrm.io/features/enrichment", "attio.com"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…For built-in enrichment, look at Attio and NovaCRM; both avoid the Clearbit-style add-on tax…",
        citedSources: ["reddit.com/r/sales"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 3,
        sentiment: "neutral",
        snippet:
          "…options include Apollo.io (sales intelligence first), NovaCRM, and HubSpot with Breeze Intelligence…",
        citedSources: ["apollo.io", "hubspot.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet:
          "…HubSpot's Breeze Intelligence and Zoho's Zia enrichment are common picks…",
        citedSources: ["hubspot.com", "zoho.com"],
      },
    ],
  },
  {
    id: "p-007",
    text: "How to migrate from Pipedrive to another CRM",
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
          "…Export your Pipedrive data as CSV, map custom fields, and use the importer in HubSpot or Salesforce…",
        citedSources: ["pipedrive.com/support", "hubspot.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 6,
        sentiment: "neutral",
        snippet:
          "…Several CRMs offer one-click Pipedrive migration, including HubSpot and NovaCRM's migration assistant…",
        citedSources: ["novacrm.io/migrate", "pipedrive.com"],
      },
      {
        engineId: "claude",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…standard CSV export/import flow applies for most destination CRMs…",
        citedSources: ["pipedrive.com/support"],
      },
      {
        engineId: "gemini",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…use Pipedrive's export tools then the destination CRM's import wizard…",
        citedSources: ["pipedrive.com/support", "zapier.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…third-party tools like Import2 can migrate deals, contacts, and activities…",
        citedSources: ["import2.com"],
      },
    ],
  },
  {
    id: "p-008",
    text: "Best CRM for SaaS sales teams with product-led growth",
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
          "…NovaCRM's product-usage signals integration makes it a fit for PLG-assist sales motions…",
        citedSources: ["novacrm.io/blog/plg", "g2.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…For PLG companies, NovaCRM and Attio integrate product analytics events directly into pipeline views…",
        citedSources: ["novacrm.io", "attio.com", "reddit.com/r/SaaS"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 3,
        sentiment: "neutral",
        snippet:
          "…consider HubSpot, Attio, or NovaCRM depending on how sales-assist your motion is…",
        citedSources: ["capterra.com"],
      },
      {
        engineId: "gemini",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…HubSpot and Salesforce with product-data connectors are common choices…",
        citedSources: ["hubspot.com", "segment.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…popular options include HubSpot, Pipedrive, and Close for SaaS sales teams…",
        citedSources: ["close.com", "pcmag.com"],
      },
    ],
  },
  {
    id: "p-009",
    text: "NovaCRM reviews and complaints",
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
          "…NovaCRM holds a 4.6/5 on G2 (420 reviews). Praise centers on automation and support; complaints mention limited offline mobile access…",
        citedSources: ["g2.com", "capterra.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Reviewers consistently highlight the AI follow-up drafts. The most common complaint is the smaller integration marketplace…",
        citedSources: ["g2.com", "reddit.com/r/sales", "trustradius.com"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Overall sentiment is positive; recent reviews note improved reporting after the Q2 2026 update…",
        citedSources: ["g2.com", "trustradius.com"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 1,
        sentiment: "neutral",
        snippet:
          "…Mixed-to-positive reviews; some users report a learning curve for workflow automation…",
        citedSources: ["capterra.com", "getapp.com"],
      },
      {
        engineId: "copilot",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Generally favorable reviews with a 4.5+ average across major review platforms…",
        citedSources: ["g2.com", "capterra.com"],
      },
    ],
  },
  {
    id: "p-010",
    text: "Cheapest CRM with sales automation",
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
          "…budget picks include Zoho CRM ($14/user), Freshsales, and HubSpot's free tier with paid automation add-ons…",
        citedSources: ["zoho.com", "hubspot.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 5,
        sentiment: "neutral",
        snippet:
          "…if budget allows slightly more, NovaCRM at $49/user includes automation that costs extra elsewhere…",
        citedSources: ["novacrm.io/pricing", "zoho.com"],
      },
      {
        engineId: "claude",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…Zoho CRM and Bigin are the usual budget recommendations…",
        citedSources: ["zoho.com", "capterra.com"],
      },
      {
        engineId: "gemini",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…Zoho CRM, Freshsales, and Agile CRM lead on price…",
        citedSources: ["forbes.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…consider Zoho CRM or HubSpot free with workflow limits…",
        citedSources: ["zoho.com", "pcmag.com"],
      },
    ],
  },
  {
    id: "p-011",
    text: "Does NovaCRM integrate with Slack and Gmail?",
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
          "…Yes. NovaCRM has native Slack and Gmail integrations, including two-way email sync and deal-room channels…",
        citedSources: ["novacrm.io/integrations"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Both integrations are native and included on all plans; Slack alerts support custom triggers…",
        citedSources: ["novacrm.io/integrations", "novacrm.io/docs"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet: "…Native Slack + Gmail support confirmed in NovaCRM's docs…",
        citedSources: ["novacrm.io/docs"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 1,
        sentiment: "neutral",
        snippet: "…Slack and Gmail integrations are listed in NovaCRM's marketplace…",
        citedSources: ["novacrm.io/integrations"],
      },
      {
        engineId: "copilot",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet: "…Yes, both are supported natively along with Outlook and Teams…",
        citedSources: ["novacrm.io/integrations"],
      },
    ],
  },
  {
    id: "p-012",
    text: "HubSpot alternatives with better AI features",
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
          "…NovaCRM is the most-cited AI-forward HubSpot alternative, with stronger forecasting and auto-drafted outreach…",
        citedSources: ["novacrm.io/compare/hubspot", "g2.com"],
      },
      {
        engineId: "perplexity",
        mentioned: true,
        position: 1,
        sentiment: "positive",
        snippet:
          "…Top AI-first alternatives: NovaCRM, Attio, and Folk. NovaCRM leads on revenue intelligence…",
        citedSources: ["g2.com", "novacrm.io", "attio.com"],
      },
      {
        engineId: "claude",
        mentioned: true,
        position: 2,
        sentiment: "positive",
        snippet:
          "…Attio and NovaCRM are the strongest options if AI capabilities are the priority…",
        citedSources: ["attio.com", "novacrm.io"],
      },
      {
        engineId: "gemini",
        mentioned: true,
        position: 2,
        sentiment: "neutral",
        snippet:
          "…consider Salesforce Einstein, NovaCRM, or Zoho Zia depending on scale…",
        citedSources: ["salesforce.com", "zoho.com"],
      },
      {
        engineId: "copilot",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        snippet: "…Dynamics 365 with Copilot and Salesforce are the main AI-heavy alternatives…",
        citedSources: ["microsoft.com", "salesforce.com"],
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
  strength: number; // 0-100 association strength with NovaCRM in AI answers
  trend: number;
  description: string;
}

export interface EntityEdge {
  source: string;
  target: string;
  weight: number; // 0-1
}

export const ENTITY_NODES: EntityNode[] = [
  { id: "novacrm", label: "NovaCRM", type: "brand", strength: 100, trend: 0, description: "The tracked brand." },
  { id: "ai-crm", label: "AI-native CRM", type: "category", strength: 86, trend: 9.1, description: "Strongest category association. Appears in 71% of answers that mention NovaCRM." },
  { id: "revenue-intel", label: "Revenue intelligence", type: "feature", strength: 74, trend: 7.4, description: "Feature most often credited to NovaCRM in AI answers." },
  { id: "enrichment", label: "Data enrichment", type: "feature", strength: 69, trend: 5.2, description: "Built-in enrichment is a recurring differentiator vs HubSpot/Pipedrive." },
  { id: "midmarket", label: "Mid-market B2B", type: "audience", strength: 64, trend: 3.8, description: "Primary audience engines associate with NovaCRM." },
  { id: "pipeline-auto", label: "Pipeline automation", type: "feature", strength: 61, trend: 2.9, description: "Frequently mentioned alongside deal scoring." },
  { id: "plg", label: "Product-led growth", type: "audience", strength: 43, trend: 6.6, description: "Emerging association driven by recent blog content." },
  { id: "crm-cat", label: "CRM software", type: "category", strength: 58, trend: 1.2, description: "Broad category association — weaker than niche categories." },
  { id: "attio", label: "Attio", type: "competitor", strength: 52, trend: 4.4, description: "Most co-mentioned competitor (usually framed as peers)." },
  { id: "hubspot", label: "HubSpot", type: "competitor", strength: 48, trend: 1.9, description: "Co-mentioned in comparison prompts; usually framed as the incumbent." },
  { id: "g2", label: "G2 reviews", type: "source", strength: 66, trend: 2.4, description: "Most influential third-party citation source for NovaCRM answers." },
  { id: "reddit", label: "Reddit threads", type: "source", strength: 45, trend: 8.2, description: "Fast-growing citation source, especially on Perplexity." },
  { id: "novablog", label: "novacrm.io blog", type: "source", strength: 59, trend: 6.1, description: "Owned content cited in 31% of NovaCRM mentions." },
  { id: "forecasting", label: "AI forecasting", type: "feature", strength: 39, trend: 3.3, description: "Under-associated relative to product strength — an opportunity." },
];

export const ENTITY_EDGES: EntityEdge[] = [
  { source: "novacrm", target: "ai-crm", weight: 0.86 },
  { source: "novacrm", target: "revenue-intel", weight: 0.74 },
  { source: "novacrm", target: "enrichment", weight: 0.69 },
  { source: "novacrm", target: "midmarket", weight: 0.64 },
  { source: "novacrm", target: "pipeline-auto", weight: 0.61 },
  { source: "novacrm", target: "crm-cat", weight: 0.58 },
  { source: "novacrm", target: "plg", weight: 0.43 },
  { source: "novacrm", target: "attio", weight: 0.52 },
  { source: "novacrm", target: "hubspot", weight: 0.48 },
  { source: "novacrm", target: "g2", weight: 0.66 },
  { source: "novacrm", target: "reddit", weight: 0.45 },
  { source: "novacrm", target: "novablog", weight: 0.59 },
  { source: "novacrm", target: "forecasting", weight: 0.39 },
  { source: "ai-crm", target: "attio", weight: 0.55 },
  { source: "enrichment", target: "attio", weight: 0.41 },
  { source: "crm-cat", target: "hubspot", weight: 0.72 },
  { source: "g2", target: "hubspot", weight: 0.5 },
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
      "Gemini omits NovaCRM from most “best CRM” answers. Closing this AEO gap means earning citations on the listicles Gemini trusts and publishing extractable comparison content engines can quote.",
    impact: "high",
    effort: "medium",
    category: "Authority",
    status: "new",
    estimatedLift: "+8–12 pp AI mention rate on Gemini",
    relatedPromptIds: ["p-001", "p-005", "p-010"],
    actions: [
      "Earn placement on Forbes Advisor / TechRadar CRM roundups that Gemini cites",
      "Publish an answer-ready comparison hub with clear H2 questions and short quotable paragraphs",
      "Refresh Capterra/GetApp profiles so third-party AEO citations stay accurate",
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
      "Sync canonical pricing across site, Capterra, and GetApp",
      "Add Product + Offer schema on the pricing page",
      "Publish an llms.txt fact file so crawlers prefer owned sources",
    ],
  },
  {
    id: "opp-003",
    title: "Win high-intent AEO comparison & alternatives prompts",
    description:
      "“Salesforce alternatives” and head-to-head prompts drive commercial AI recommendations. Competitors dominate these answers; NovaCRM needs stronger comparison coverage to improve AEO visibility.",
    impact: "high",
    effort: "medium",
    category: "Comparisons",
    status: "new",
    estimatedLift: "+15 pp mention rate on alternatives prompts",
    relatedPromptIds: ["p-005", "p-012"],
    actions: [
      "Ship NovaCRM vs Salesforce / HubSpot pages with migration CTAs",
      "Add comparison tables engines can lift into answers",
      "Seed credible third-party discussions that Perplexity can cite",
    ],
  },
  {
    id: "opp-004",
    title: "Strengthen entity associations for AI forecasting",
    description:
      "Answer engines weakly associate NovaCRM with forecasting despite it being a core capability. Stronger entity relationships improve how models describe and recommend the brand.",
    impact: "medium",
    effort: "low",
    category: "Knowledge Graph",
    status: "new",
    estimatedLift: "+20 entity strength for AI forecasting",
    relatedPromptIds: ["p-003", "p-008"],
    actions: [
      "Publish a forecasting benchmark with methodology and stats",
      "Connect Product → Feature entities in schema and copy",
      "Repeat “AI forecasting for mid-market CRM” phrasing on homepage and docs",
    ],
  },
  {
    id: "opp-005",
    title: "Build citation authority for Perplexity AEO wins",
    description:
      "Perplexity visibility tracks community and review citations. Growing authoritative, linkable proof points increases how often NovaCRM is recommended in sourced answers.",
    impact: "medium",
    effort: "medium",
    category: "Citations",
    status: "new",
    estimatedLift: "+5 pp Perplexity mention rate",
    relatedPromptIds: ["p-005", "p-008", "p-009"],
    actions: [
      "Create cite-worthy docs (limits, pricing, security) people naturally link",
      "Earn independent reviews with clear product positioning",
      "Monitor recommendation threads and contribute useful, non-spammy answers",
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
      "Add FAQPage schema on docs and pricing",
    ],
  },
  {
    id: "opp-007",
    title: "Capture switch-intent AEO prompts with migration FAQs",
    description:
      "Migration how-tos are high-intent moments in AI answers. Expanding FAQ and how-to content improves inclusion when users ask how to leave Salesforce/Pipedrive/HubSpot.",
    impact: "low",
    effort: "high",
    category: "FAQ",
    status: "new",
    estimatedLift: "+10 pp on migration prompts",
    relatedPromptIds: ["p-007"],
    actions: [
      "Publish step-by-step migration guides as FAQ-structured pages",
      "Add HowTo + FAQ schema for each migration path",
      "Link guides from pricing and comparison pages for internal authority",
    ],
  },
  {
    id: "opp-008",
    title: "Add answer-extractable snippets on key landing pages",
    description:
      "Models prefer short, self-contained paragraphs that directly answer buyer questions. Improving snippet readiness raises the chance NovaCRM is quoted in AI answers.",
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
    title: "Competitor alert: Attio momentum",
    period: "Jul 10, 2026",
    createdAt: "2026-07-10T16:22:00Z",
    type: "Competitor alert",
    status: "ready",
    highlights: [
      "Attio share of voice up 2.7 pp in two weeks",
      "New TechCrunch coverage cited across ChatGPT and Claude",
      "Attio now co-mentioned with NovaCRM in 52% of AI-CRM prompts",
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
  { id: "a2", type: "change", title: "Position improved on ChatGPT", detail: "\u201cBest AI-powered CRM tools\u201d moved from #3 to #2", time: "2026-07-14T09:12:00Z" },
  { id: "a3", type: "alert", title: "Gemini citing outdated pricing", detail: "2024 pricing surfaced from a stale Capterra listing", time: "2026-07-13T17:40:00Z" },
  { id: "a4", type: "opportunity", title: "New opportunity identified", detail: "Close the Gemini visibility gap on best-of prompts", time: "2026-07-13T17:38:00Z" },
  { id: "a5", type: "report", title: "Weekly digest ready", detail: "Jul 7 – Jul 13 digest generated", time: "2026-07-14T10:00:00Z" },
  { id: "a6", type: "change", title: "New citation detected", detail: "venturebeat.com now cites novacrm.io on AI CRM prompts", time: "2026-07-12T08:15:00Z" },
];

export const SENTIMENT_BREAKDOWN = [
  { name: "Positive", value: 58, color: "#34d399" },
  { name: "Neutral", value: 34, color: "#8b8b9e" },
  { name: "Negative", value: 8, color: "#f87171" },
];

export const CITATION_SOURCES = [
  { source: "g2.com", citations: 148, share: 21.4, trend: 2.1, owned: false },
  { source: "novacrm.io", citations: 132, share: 19.1, trend: 6.4, owned: true },
  { source: "reddit.com", citations: 87, share: 12.6, trend: 8.2, owned: false },
  { source: "capterra.com", citations: 74, share: 10.7, trend: -1.3, owned: false },
  { source: "techradar.com", citations: 52, share: 7.5, trend: 0.8, owned: false },
  { source: "trustradius.com", citations: 41, share: 5.9, trend: 1.7, owned: false },
  { source: "forbes.com", citations: 38, share: 5.5, trend: -0.4, owned: false },
  { source: "venturebeat.com", citations: 22, share: 3.2, trend: 4.9, owned: false },
];

// Content Optimizer sample analysis
export const OPTIMIZER_SAMPLE = {
  url: "novacrm.io/blog/ai-crm-guide",
  score: 68,
  checks: [
    { id: "c1", label: "Direct answer in first 100 words", status: "pass" as const, detail: "The opening paragraph directly defines AI-native CRM — engines can lift it as a snippet." },
    { id: "c2", label: "Question-based H2/H3 headings", status: "pass" as const, detail: "7 of 9 headings are phrased as questions matching tracked prompts." },
    { id: "c3", label: "FAQ schema markup", status: "fail" as const, detail: "No FAQPage structured data found. Add schema for the 6 FAQ items at the bottom of the page." },
    { id: "c4", label: "Statistics with citable sources", status: "warn" as const, detail: "4 statistics lack linked sources. Engines prefer verifiable claims." },
    { id: "c5", label: "Comparison table present", status: "pass" as const, detail: "The feature comparison table is well-structured with <table> markup." },
    { id: "c6", label: "Freshness signal", status: "warn" as const, detail: "Last-modified date is 94 days old. Refresh with 2026 data and update dateModified." },
    { id: "c7", label: "Entity clarity", status: "pass" as const, detail: "NovaCRM is consistently referenced with category context (\u201cAI-native CRM\u201d)." },
    { id: "c8", label: "Crawler accessibility", status: "pass" as const, detail: "Page is accessible to GPTBot, ClaudeBot, and PerplexityBot." },
    { id: "c9", label: "Standalone extractable paragraphs", status: "fail" as const, detail: "3 key sections depend on surrounding context and can't be quoted standalone." },
  ],
  suggestions: [
    {
      title: "Add an FAQ block with schema",
      before: "The page ends with a generic conclusion paragraph.",
      after:
        "Append 6 Q&A pairs mirroring tracked prompts (\u201cHow much does an AI CRM cost?\u201d, \u201cWhat is the best AI CRM for mid-market?\u201d) wrapped in FAQPage JSON-LD.",
      impact: "high" as const,
    },
    {
      title: "Make the pricing claim self-contained",
      before: "\u201cAs mentioned above, our Growth plan is affordable for most teams.\u201d",
      after:
        "\u201cNovaCRM's Growth plan costs $49 per user per month (billed annually), which includes pipeline automation and data enrichment.\u201d",
      impact: "high" as const,
    },
    {
      title: "Attach sources to statistics",
      before: "\u201cTeams using AI CRMs close deals 23% faster.\u201d",
      after:
        "\u201cTeams using AI CRMs close deals 23% faster, according to NovaCRM's 2026 Revenue Benchmark of 1,400 B2B teams [link].\u201d",
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
