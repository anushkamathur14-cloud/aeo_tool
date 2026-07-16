import { createAgentLog } from "./types";

export type ClassifiedAnswer = {
  prompt: string;
  engineId: string;
  intent:
    | "best-of"
    | "comparison"
    | "pricing"
    | "alternatives"
    | "recommendation"
    | "how-to"
    | "general";
  sentiment: "positive" | "neutral" | "negative";
  journeyStage: "awareness" | "discovery" | "research" | "comparison" | "purchase" | "support";
  topics: string[];
};

/**
 * Classification Agent — labels prompt intent, journey stage, sentiment, and topics.
 */
export function runClassificationAgent(args: {
  brand: string;
  category: string;
  answers: Array<{ prompt: string; engineId: string; text: string; brandMentioned: boolean }>;
}) {
  const log = createAgentLog();
  log.push("classification", `Classifying ${args.answers.length} answers`);

  const classified: ClassifiedAnswer[] = args.answers.map((answer) => {
    const prompt = answer.prompt.toLowerCase();
    const text = answer.text.toLowerCase();

    let intent: ClassifiedAnswer["intent"] = "general";
    if (/vs|versus|compared|compare/.test(prompt)) intent = "comparison";
    else if (/alternative/.test(prompt)) intent = "alternatives";
    else if (/price|cost|subscription|how much/.test(prompt)) intent = "pricing";
    else if (/best|top|trusted/.test(prompt)) intent = "best-of";
    else if (/should i|recommend|buy|subscribe/.test(prompt)) intent = "recommendation";
    else if (/how |where |get started/.test(prompt)) intent = "how-to";

    let journeyStage: ClassifiedAnswer["journeyStage"] = "discovery";
    if (intent === "best-of") journeyStage = "awareness";
    if (intent === "alternatives" || intent === "comparison") journeyStage = "comparison";
    if (intent === "pricing" || intent === "recommendation") journeyStage = "purchase";
    if (intent === "how-to") journeyStage = "support";
    if (/is .* good|what do people/.test(prompt)) journeyStage = "research";

    let sentiment: ClassifiedAnswer["sentiment"] = "neutral";
    if (answer.brandMentioned) {
      if (/\b(best|excellent|recommend|standout|great)\b/.test(text)) sentiment = "positive";
      else if (/\b(overpriced|poor|avoid|worse|disappointing)\b/.test(text)) sentiment = "negative";
      else sentiment = "positive";
    } else if (/\b(crowded|expensive|confusing)\b/.test(text)) sentiment = "negative";

    const topics = [args.category, intent, journeyStage];
    if (args.brand) topics.push(args.brand);

    return {
      prompt: answer.prompt,
      engineId: answer.engineId,
      intent,
      sentiment,
      journeyStage,
      topics,
    };
  });

  const intentCounts = classified.reduce<Record<string, number>>((acc, row) => {
    acc[row.intent] = (acc[row.intent] ?? 0) + 1;
    return acc;
  }, {});

  log.push("classification", "Intent mix ready", { intentCounts });

  return { log: log.events, classified, intentCounts };
}
