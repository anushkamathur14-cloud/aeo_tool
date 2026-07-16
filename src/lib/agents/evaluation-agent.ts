import { textMentionsBrand } from "../brand-mentions-core";
import { createAgentLog } from "./types";
import type { ProviderResult } from "../providers";

export type EvaluationInput = {
  prompt: string;
  brand: string;
  peers: string[];
  engineId: string;
  engineName: string;
  color: string;
  result: ProviderResult;
};

/**
 * Evaluation Agent — scores each answer for brand inclusion, rank, and peer presence.
 */
export function runEvaluationAgent(args: {
  brand: string;
  items: EvaluationInput[];
}) {
  const log = createAgentLog();
  log.push("evaluation", `Evaluating ${args.items.length} responses for brand visibility`);

  const evaluated = args.items.map((item) => {
    const text = item.result.text;
    const mentionedNames = [
      ...item.result.mentions.map((mention) => mention.company),
      ...item.peers.filter((peer) => textMentionsBrand(text, peer)),
      ...(args.brand && textMentionsBrand(text, args.brand) ? [args.brand] : []),
    ].filter(
      (value, index, list) =>
        list.findIndex((entry) => entry.toLowerCase() === value.toLowerCase()) === index,
    );

    const brandMentioned = Boolean(
      args.brand &&
        (item.result.mentions.some(
          (mention) => mention.company.toLowerCase() === args.brand.toLowerCase(),
        ) ||
          textMentionsBrand(text, args.brand)),
    );

    let brandPosition: number | null = null;
    if (brandMentioned) {
      brandPosition =
        item.result.mentions.find(
          (mention) => mention.company.toLowerCase() === args.brand.toLowerCase(),
        )?.order ??
        mentionedNames.findIndex((name) => name.toLowerCase() === args.brand.toLowerCase()) + 1;
      if (!brandPosition) brandPosition = 1;
    }

    const recommended =
      /\b(recommend|best|top pick|worth (it|trying)|should (get|buy|subscribe))\b/i.test(text) &&
      brandMentioned;

    return {
      engineId: item.engineId,
      engineName: item.engineName,
      color: item.color,
      prompt: item.prompt,
      text,
      brandMentioned,
      brandPosition,
      mentionedNames,
      recommendationStrength: item.result.recommendationStrength,
      recommended,
      latencyMs: item.result.latencyMs,
      confidence: item.result.confidence,
    };
  });

  const mentionCount = evaluated.filter((row) => row.brandMentioned).length;
  log.push("evaluation", `Found ${mentionCount}/${evaluated.length} brand mentions`, {
    mentionCount,
    recommendCount: evaluated.filter((row) => row.recommended).length,
  });

  return { log: log.events, evaluated };
}
