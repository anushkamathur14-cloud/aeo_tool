import {
  generateLookupPrompts,
  summarizeLookupResults,
  type OnDemandLookupInput,
} from "@/lib/domain/lookup";
import type { ProviderId, ProviderKeys } from "@/lib/providers";
import { runClassificationAgent } from "./classification-agent";
import { runEvaluationAgent } from "./evaluation-agent";
import { isCommercialPrompt, runFanoutAgent } from "./fanout-agent";
import { runFaqAgent } from "./faq-agent";
import { runQueryAgent } from "./query-agent";
import type { AgentEvent } from "./types";

const ENGINE_MAP = [
  { id: "chatgpt", provider: "openai" as const, name: "ChatGPT", color: "#34d399" },
  { id: "claude", provider: "anthropic" as const, name: "Claude", color: "#f59e0b" },
  { id: "perplexity", provider: "perplexity" as const, name: "Perplexity", color: "#38bdf8" },
  { id: "gemini", provider: "google" as const, name: "Gemini", color: "#818cf8" },
  { id: "grok", provider: "xai" as const, name: "Grok", color: "#a3a3a3" },
];

/**
 * Orchestrates Query → Evaluation → Classification → Fan-out → FAQ agents.
 */
export async function runLookupAgentPipeline(args: {
  input: OnDemandLookupInput & { mode: "live" | "demo" };
  keys: ProviderKeys;
}) {
  const { input, keys: rawKeys } = args;
  const brand = input.brand.trim();
  const mode = input.mode;
  // Hard-isolate demo from any client-supplied keys.
  const keys = mode === "demo" ? ({} as ProviderKeys) : rawKeys;
  const promptLimit = mode === "live" ? Math.min(input.promptLimit, 4) : input.promptLimit;
  const prompts = generateLookupPrompts({ ...input, promptLimit });
  const category = prompts[0]?.category ?? input.category;
  const peers = prompts[0]?.peers ?? [];

  const configured = ENGINE_MAP.filter((engine) => Boolean(keys[engine.provider]));
  if (mode === "live" && configured.length === 0) {
    return {
      ok: false as const,
      status: 400 as const,
      error: "Live lookup needs at least one API key. Add keys in Settings, or switch to Demo mode.",
      code: "MISSING_API_KEYS",
    };
  }

  const engines = mode === "live" ? configured : ENGINE_MAP;
  const jobsWithMeta = prompts.flatMap((prompt) =>
    engines.map((engine) => ({
      prompt: prompt.text,
      company: brand || peers[0] || category,
      competitors: peers.slice(0, 4),
      providerId: (mode === "demo" ? "mock" : engine.provider) as ProviderId,
      engineId: engine.id,
      engineName: engine.name,
      color: engine.color,
      category,
    })),
  );

  const query = await runQueryAgent({
    jobs: jobsWithMeta.map(({ prompt, company, competitors, providerId, category: jobCategory, engineName }) => ({
      prompt,
      company,
      competitors,
      providerId,
      category: jobCategory,
      engineLabel: engineName,
    })),
    keys,
    mode,
  });

  const evaluationInputs = query.responses.map((response) => {
    const meta = jobsWithMeta.find(
      (job) => job.prompt === response.prompt && job.providerId === response.providerId,
    );
    return {
      prompt: response.prompt,
      brand,
      peers,
      engineId: meta?.engineId ?? response.providerId,
      engineName: meta?.engineName ?? response.engineLabel ?? response.providerId,
      color: meta?.color ?? "#a3a3a3",
      result: response.result,
    };
  });

  const evaluation = runEvaluationAgent({ brand, items: evaluationInputs });
  if (mode === "live" && evaluation.evaluated.length === 0) {
    const failureHint = query.failures[0]?.error;
    return {
      ok: false as const,
      status: 502 as const,
      error: failureHint
        ? `Live lookup failed: ${failureHint}`
        : "Live lookup returned no evaluable answers. Check API keys and try again.",
      code: "LIVE_LOOKUP_FAILED",
    };
  }

  const classification = runClassificationAgent({
    brand,
    category,
    answers: evaluation.evaluated.map((row) => ({
      prompt: row.prompt,
      engineId: row.engineId,
      text: row.text,
      brandMentioned: row.brandMentioned,
    })),
  });

  const summary = summarizeLookupResults({
    brand,
    category,
    results: evaluation.evaluated,
  });

  const commercialRoots = [
    ...new Set(
      prompts
        .map((prompt) => prompt.text)
        .filter((text) => isCommercialPrompt(text)),
    ),
  ];
  // Fall back so evidence map always has something to expand
  const fanoutRoots =
    commercialRoots.length > 0 ? commercialRoots : prompts.slice(0, 2).map((prompt) => prompt.text);

  const fanout = runFanoutAgent({
    brand,
    category,
    peers,
    commercialRoots: fanoutRoots,
    scoreLeaves: true,
  });

  const faq = runFaqAgent({
    brand,
    category,
    mode,
    mentionCount: summary.mentionCount,
    totalAnswers: summary.totalAnswers,
    mentionRate: summary.mentionRate,
    avgPosition: summary.avgPosition,
    topBrands: summary.shareOfVoice.map((row) => ({ name: row.name, share: row.share })),
    totalCostUsd: query.totalCostUsd,
    liveEngines: [...new Set(evaluation.evaluated.map((row) => row.engineName))],
    evidenceMap: fanout.evidenceMap,
    results: evaluation.evaluated.map((row) => ({
      prompt: row.prompt,
      engineName: row.engineName,
      brandMentioned: row.brandMentioned,
      brandPosition: row.brandPosition,
      text: row.text,
      mentionedNames: row.mentionedNames,
    })),
    intentCounts: classification.intentCounts,
  });

  const agentTrace: AgentEvent[] = [
    ...query.log,
    ...evaluation.log,
    ...classification.log,
    ...fanout.log,
    ...faq.log,
  ];

  return {
    ok: true as const,
    mode,
    liveEngines: mode === "live" ? [...new Set(evaluation.evaluated.map((row) => row.engineName))] : [],
    failedEngines:
      mode === "live"
        ? [
            ...new Set(
              query.failures.map((failure) => failure.engineLabel ?? failure.providerId),
            ),
          ]
        : [],
    providerErrors:
      mode === "live"
        ? Object.fromEntries(
            [...new Map(query.failures.map((failure) => [failure.engineLabel ?? failure.providerId, failure.error]))],
          )
        : {},
    cost: {
      totalUsd: query.totalCostUsd,
      ledger: query.ledger,
    },
    agents: {
      query: query.log,
      evaluation: evaluation.log,
      classification: classification.log,
      fanout: fanout.log,
      faq: faq.log,
    },
    agentTrace,
    classified: classification.classified,
    intentCounts: classification.intentCounts,
    evidenceMap: fanout.evidenceMap,
    faqs: faq.faqs,
    appearances: faq.appearances,
    ...summary,
  };
}
