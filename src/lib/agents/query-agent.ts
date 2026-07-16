import { getProvider, type ProviderId, type ProviderKeys, type ProviderResult } from "../providers";
import {
  createAgentLog,
  estimateCostUsd,
  estimateTokens,
  type CostLedgerEntry,
} from "./types";

export type QueryJob = {
  prompt: string;
  company: string;
  competitors: string[];
  providerId: ProviderId;
};

/**
 * Query Agent — sends prompts to answer engines and maintains a running cost ledger.
 */
export async function runQueryAgent(args: {
  jobs: QueryJob[];
  keys: ProviderKeys;
  mode: "live" | "demo";
}) {
  const log = createAgentLog();
  const ledger: CostLedgerEntry[] = [];
  const responses: Array<QueryJob & { result: ProviderResult; costUsd: number }> = [];

  log.push("query", `Starting ${args.mode} query batch`, {
    jobs: args.jobs.length,
  });

  for (const job of args.jobs) {
    const provider =
      args.mode === "demo" ? getProvider("mock") : getProvider(job.providerId);
    const result = await provider.complete(
      {
        prompt: job.prompt,
        company: job.company,
        competitors: job.competitors,
      },
      args.keys,
    );
    const promptTokensEst = estimateTokens(job.prompt);
    const completionTokensEst = estimateTokens(result.text);
    const costUsd = estimateCostUsd(result.model, promptTokensEst, completionTokensEst);
    ledger.push({
      provider: result.provider,
      model: result.model,
      promptTokensEst,
      completionTokensEst,
      costUsd,
    });
    responses.push({ ...job, result, costUsd });
    log.push("query", `Queried ${result.provider}/${result.model}`, {
      costUsd,
      latencyMs: result.latencyMs,
      prompt: job.prompt.slice(0, 80),
    });
  }

  const totalCostUsd = Number(ledger.reduce((sum, row) => sum + row.costUsd, 0).toFixed(6));
  log.push("query", `Batch complete · est. cost $${totalCostUsd}`, {
    totalCostUsd,
    responses: responses.length,
  });

  return { log: log.events, ledger, responses, totalCostUsd };
}
