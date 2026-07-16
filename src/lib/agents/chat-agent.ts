export type LookupChatContext = {
  brand: string;
  category: string;
  mode: "live" | "demo";
  mentionCount: number;
  totalAnswers: number;
  mentionRate: number;
  avgPosition: number | null;
  shareOfVoice: Array<{ name: string; share: number; count?: number }>;
  byEngine: Array<{
    engineName: string;
    mentions: number;
    answers: number;
    mentionRate: number;
    avgPosition: number | null;
  }>;
  faqs?: Array<{ question: string; answer: string }>;
  appearances?: Array<{
    kind: "mentioned" | "missed";
    prompt: string;
    engineName: string;
    position: number | null;
    snippet: string;
    peers: string[];
  }>;
  evidenceMap?: {
    fanouts: number;
    evidenceShare: number;
    navigationalShare: number;
    brandInNavigationalQueries: number;
    brandWinsNavigational: number;
    insight: string;
  };
  results?: Array<{
    prompt: string;
    engineName: string;
    brandMentioned: boolean;
    brandPosition: number | null;
    text: string;
    mentionedNames: string[];
  }>;
  intentCounts?: Record<string, number>;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatAnswer = {
  answer: string;
  suggestedFollowUps: string[];
};

/**
 * Lookup chat agent — answers follow-up questions grounded only in this run's data.
 */
export function answerLookupChat(question: string, context: LookupChatContext): ChatAnswer {
  const q = question.trim().toLowerCase();
  const brand = context.brand || "this brand";
  const leader = context.shareOfVoice[0];
  const weakest = [...context.byEngine].sort((a, b) => a.mentionRate - b.mentionRate)[0];
  const strongest = [...context.byEngine].sort((a, b) => b.mentionRate - a.mentionRate)[0];
  const mentioned = (context.results ?? []).filter((row) => row.brandMentioned);
  const missed = (context.results ?? []).filter((row) => !row.brandMentioned);
  const followUps = defaultFollowUps(context);

  if (!q) {
    return {
      answer: "Ask a specific question about this lookup — mention rate, engines, competitors, gaps, or fan-outs.",
      suggestedFollowUps: followUps,
    };
  }

  if (/how often|mention rate|inclusion|show up|appears?/.test(q) && /often|rate|much|%|percent|inclusion|show|appear/.test(q)) {
    return {
      answer: context.brand
        ? `${brand} appeared in ${context.mentionCount} of ${context.totalAnswers} answers (${context.mentionRate}% mention rate)${
            context.avgPosition ? `, at an average position of #${context.avgPosition}` : ""
          }.`
        : `This was a category scan for ${context.category}. ${leader?.name ?? "Leaders"} dominate share of voice.`,
      suggestedFollowUps: followUps,
    };
  }

  if (/which engine|per engine|gemini|chatgpt|claude|perplexity|grok|weakest|strongest|best engine|worst engine/.test(q)) {
    if (!context.brand) {
      return {
        answer: `Across engines this run produced ${context.totalAnswers} answers for ${context.category}. Add a brand to compare mention rate by engine.`,
        suggestedFollowUps: followUps,
      };
    }
    if (/weak|worst|lowest|missing|omit/.test(q) && weakest) {
      return {
        answer: `${weakest.engineName} is the weakest for ${brand} in this run (${weakest.mentions}/${weakest.answers}, ${weakest.mentionRate}%). ${
          strongest ? `Strongest: ${strongest.engineName} at ${strongest.mentionRate}%.` : ""
        }`,
        suggestedFollowUps: followUps,
      };
    }
    const lines = context.byEngine
      .map(
        (engine) =>
          `${engine.engineName}: ${engine.mentions}/${engine.answers} (${engine.mentionRate}%)${
            engine.avgPosition ? ` · avg #${engine.avgPosition}` : ""
          }`,
      )
      .join("; ");
    return {
      answer: `${brand} by engine — ${lines || "no engine breakdown available"}.`,
      suggestedFollowUps: followUps,
    };
  }

  if (/who leads|share of voice|competitor|vs |versus|beats|ahead|rival/.test(q)) {
    const top = context.shareOfVoice
      .slice(0, 4)
      .map((row) => `${row.name} (${row.share}%)`)
      .join(", ");
    const rival = context.shareOfVoice.find((row) => row.name.toLowerCase() !== brand.toLowerCase());
    return {
      answer: top
        ? `Share of voice leaders: ${top}.${
            rival
              ? ` Closest peer pressure for ${brand}: ${rival.name} at ${rival.share}%.`
              : ""
          }`
        : `Not enough peer brands were extracted from ${context.category} answers.`,
      suggestedFollowUps: followUps,
    };
  }

  if (/miss|gap|absent|not mentioned|left out|omitted|where is .+ miss/.test(q)) {
    const sample = missed[0] ?? context.appearances?.find((row) => row.kind === "missed");
    if (!sample) {
      return {
        answer: context.brand
          ? `${brand} had no clear misses in the sampled answers for this run.`
          : "Add a brand to measure gaps.",
        suggestedFollowUps: followUps,
      };
    }
    let peerNames: string[] = [];
    if ("peers" in sample && Array.isArray(sample.peers)) {
      peerNames = sample.peers;
    } else if ("mentionedNames" in sample && Array.isArray(sample.mentionedNames)) {
      peerNames = sample.mentionedNames.slice(0, 3);
    }
    const peers = peerNames.length ? peerNames.join(", ") : leader?.name ?? "category leaders";
    return {
      answer: `${brand} missed “${sample.prompt}” on ${sample.engineName}. Peers that appeared instead: ${peers}. Closing this usually means stronger comparison/evidence pages for that prompt family.`,
      suggestedFollowUps: followUps,
    };
  }

  if (/where|when|context|prompt|question type|intent|show up|recommended|recommend/.test(q)) {
    const hit = mentioned[0] ?? context.appearances?.find((row) => row.kind === "mentioned");
    const intents = context.intentCounts
      ? Object.entries(context.intentCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([intent, count]) => `${intent} (${count})`)
          .join(", ")
      : "";
    if (hit) {
      return {
        answer: `${brand} shows up on prompts like “${"prompt" in hit ? hit.prompt : ""}”${
          "engineName" in hit ? ` via ${hit.engineName}` : ""
        }${
          "position" in hit && hit.position ? ` at #${hit.position}` : ""
        }.${intents ? ` Intent mix: ${intents}.` : ""} Across this run: ${mentioned.length} mentions, ${missed.length} misses.`,
        suggestedFollowUps: followUps,
      };
    }
    return {
      answer: context.brand
        ? `${brand} was not clearly recommended in the sampled answers for ${context.category}. Ask about gaps or fan-outs next.`
        : `No brand focus was set. Leaders in ${context.category}: ${leader?.name ?? "n/a"}.`,
      suggestedFollowUps: followUps,
    };
  }

  if (/fan-?out|navigational|evidence map|brand-check|citation/.test(q)) {
    if (!context.evidenceMap) {
      return {
        answer: "No fan-out evidence map is attached to this run.",
        suggestedFollowUps: followUps,
      };
    }
    const map = context.evidenceMap;
    return {
      answer: `This run mapped ${map.fanouts} fan-outs (~${map.evidenceShare}% informational evidence, ~${map.navigationalShare}% navigational). ${
        context.brand
          ? `${brand} appeared in ${map.brandInNavigationalQueries} brand-check queries and won ${map.brandWinsNavigational}. `
          : ""
      }${map.insight}`,
      suggestedFollowUps: followUps,
    };
  }

  if (/improve|next|what should|fix|opportunity|aeo|content/.test(q)) {
    return {
      answer: context.brand
        ? `To improve ${brand} on ${context.category}: (1) prioritize commercial prompts where recommendations happen, (2) own navigational pages (${brand} pricing, vs-pages, reviews), (3) publish informational proof for fan-out evidence queries, (4) close the weakest engine${
            weakest ? ` — currently ${weakest.engineName}` : ""
          }.`
        : `Pick a brand, re-run lookup, then attack the commercial prompts where leaders dominate.`,
      suggestedFollowUps: followUps,
    };
  }

  if (/demo|live|data source|real|sample/.test(q)) {
    return {
      answer:
        context.mode === "live"
          ? "This run used live answer-engine responses from your configured API keys."
          : "This run used demo sample answers only — useful for walkthroughs, not live model output.",
      suggestedFollowUps: followUps,
    };
  }

  // Fall back to closest FAQ, then a compact summary
  const faqHit = context.faqs?.find((faq) =>
    faq.question
      .toLowerCase()
      .split(/\W+/)
      .filter((token) => token.length > 3)
      .some((token) => q.includes(token)),
  );
  if (faqHit) {
    return { answer: faqHit.answer, suggestedFollowUps: followUps };
  }

  return {
    answer: context.brand
      ? `${brand} · ${context.category}: ${context.mentionRate}% mention rate (${context.mentionCount}/${context.totalAnswers})${
          context.avgPosition ? `, avg #${context.avgPosition}` : ""
        }. Leader: ${leader?.name ?? "n/a"}. Ask about engines, gaps, competitors, or fan-outs for more detail.`
      : `${context.category} scan complete with ${context.totalAnswers} answers. Leader: ${leader?.name ?? "n/a"}.`,
    suggestedFollowUps: followUps,
  };
}

export function defaultFollowUps(context: LookupChatContext) {
  const brand = context.brand || "the brand";
  return [
    `How often does ${brand} show up?`,
    `Which engine is weakest for ${brand}?`,
    `Where is ${brand} missing?`,
    `Who leads share of voice?`,
    `What should I improve next?`,
  ];
}
