export type AgentRole = "query" | "evaluation" | "classification" | "fanout" | "faq";

export type AgentEvent = {
  agent: AgentRole;
  at: string;
  message: string;
  meta?: Record<string, unknown>;
};

export type CostLedgerEntry = {
  provider: string;
  model: string;
  promptTokensEst: number;
  completionTokensEst: number;
  costUsd: number;
};

/** Rough public list prices for demo cost accounting (USD per 1M tokens). */
export const MODEL_COST_PER_MILLION: Record<string, { input: number; output: number }> = {
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "claude-3-5-haiku-latest": { input: 0.8, output: 4 },
  "gemini-2.5-flash": { input: 0.15, output: 0.6 },
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
  "gemini-flash-latest": { input: 0.15, output: 0.6 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
  "grok-3-mini": { input: 0.3, output: 0.5 },
  sonar: { input: 1, output: 1 },
  "brandsignal-demo-v1": { input: 0, output: 0 },
};

export function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length * 1.3));
}

export function estimateCostUsd(model: string, promptTokens: number, completionTokens: number) {
  const rates = MODEL_COST_PER_MILLION[model] ?? { input: 0.5, output: 1.5 };
  return Number(
    ((promptTokens / 1_000_000) * rates.input + (completionTokens / 1_000_000) * rates.output).toFixed(6),
  );
}

export function createAgentLog() {
  const events: AgentEvent[] = [];
  return {
    events,
    push(agent: AgentRole, message: string, meta?: Record<string, unknown>) {
      events.push({ agent, at: new Date().toISOString(), message, meta });
    },
  };
}
