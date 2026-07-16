"use client";

import { useMemo, useState, type RefObject } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Coins,
  GitBranch,
  MessageCircle,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LookupChatPanel } from "@/components/lookup/lookup-chat-panel";
import { buildLookupInsights } from "@/lib/domain/lookup-insights";
import { BRAND } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import type { LookupChatContext } from "@/lib/agents/chat-agent";

type ResultPayload = {
  mode: "live" | "demo";
  brand: string;
  category: string;
  mentionRate: number;
  mentionCount: number;
  totalAnswers: number;
  avgPosition: number | null;
  shareOfVoice: Array<{ name: string; share: number; count?: number }>;
  byEngine: Array<{
    engineId: string;
    engineName: string;
    color: string;
    answers: number;
    mentions: number;
    mentionRate: number;
    avgPosition: number | null;
  }>;
  results: Array<{
    engineId: string;
    engineName: string;
    color: string;
    prompt: string;
    text: string;
    brandMentioned: boolean;
    brandPosition: number | null;
    mentionedNames: string[];
  }>;
  cost?: { totalUsd: number };
  faqs?: Array<{ question: string; answer: string; confidence: number; kind?: string }>;
  appearances?: Array<{
    kind: "mentioned" | "missed";
    prompt: string;
    engineName: string;
    position: number | null;
    snippet: string;
    peers: string[];
  }>;
  intentCounts?: Record<string, number>;
  evidenceMap?: {
    roots: number;
    fanouts: number;
    evidenceShare: number;
    navigationalShare: number;
    brandInNavigationalQueries: number;
    brandWinsNavigational: number;
    insight: string;
    nodes: Array<{
      id: string;
      parentId: string | null;
      query: string;
      intent: "commercial" | "informational" | "navigational";
      role: "root" | "evidence" | "brand-check";
      brandInQuery: boolean;
      brandMentioned: boolean | null;
      note: string;
    }>;
  };
  liveEngines?: string[];
  failedEngines?: string[];
  providerErrors?: Record<string, string>;
};

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "size-3.5",
            index < count ? "fill-warning text-warning" : "text-border-strong",
          )}
        />
      ))}
    </div>
  );
}

function formatCost(usd: number) {
  if (usd <= 0) return "$0.00";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(3)}`;
}

export function LookupResults({
  result,
  chatContext,
  resultsTopRef,
}: {
  result: ResultPayload;
  chatContext: LookupChatContext;
  resultsTopRef: RefObject<HTMLDivElement | null>;
}) {
  const insights = useMemo(
    () =>
      buildLookupInsights({
        brand: result.brand,
        category: result.category,
        mode: result.mode,
        mentionRate: result.mentionRate,
        mentionCount: result.mentionCount,
        totalAnswers: result.totalAnswers,
        avgPosition: result.avgPosition,
        shareOfVoice: result.shareOfVoice,
        byEngine: result.byEngine,
        results: result.results,
        intentCounts: result.intentCounts,
        appearances: result.appearances,
        evidenceMap: result.evidenceMap,
        faqs: result.faqs,
      }),
    [result],
  );

  const [activePrompt, setActivePrompt] = useState(insights.explorer[0]?.prompt ?? "");
  const activeExplorer =
    insights.explorer.find((item) => item.prompt === activePrompt) ?? insights.explorer[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div ref={resultsTopRef} className="scroll-mt-4" />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={result.mode === "live" ? "positive" : "accent"}>
          {result.mode === "live" ? "Live data" : "Demo · no API keys"}
        </Badge>
        <Badge tone="info">{result.category}</Badge>
        {result.brand ? <Badge>{result.brand}</Badge> : <Badge>Category scan</Badge>}
        {result.liveEngines?.length ? (
          <Badge>Engines: {result.liveEngines.join(", ")}</Badge>
        ) : null}
        {result.failedEngines?.length ? (
          <Badge tone="warning">Failed: {result.failedEngines.join(", ")}</Badge>
        ) : null}
        <Badge tone="info">Query cost {formatCost(result.cost?.totalUsd ?? 0)}</Badge>
      </div>

      {result.providerErrors && Object.keys(result.providerErrors).length > 0 ? (
        <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          {Object.entries(result.providerErrors).map(([engine, message]) => (
            <p key={engine}>
              <span className="font-semibold">{engine}:</span> {message}
            </p>
          ))}
        </div>
      ) : null}

      {result.brand && result.brand.toLowerCase() !== BRAND.name.toLowerCase() ? (
        <div className="rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-xs leading-relaxed text-muted-strong">
          Looking up <span className="font-medium text-foreground">{result.brand}</span>.
          Dashboard & Competitors still show the{" "}
          <span className="font-medium text-foreground">{BRAND.name}</span> demo workspace —{" "}
          <Link href="/competitors" className="font-semibold text-accent-strong hover:underline">
            open Competitors
          </Link>{" "}
          for that sample landscape.
        </div>
      ) : null}

      {/* Executive summary */}
      <section className="rounded-2xl border border-border/50 bg-gradient-to-br from-surface to-surface-raised p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">
              Executive summary
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">Overall health</h2>
          </div>
          <Badge tone="accent">Confidence {insights.executive.confidence}%</Badge>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded-xl bg-surface-raised/80 px-4 py-3 lg:col-span-1">
            <p className="text-[11px] text-muted">Health score</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
              {insights.executive.health}
              <span className="text-base text-muted"> / 100</span>
            </p>
          </div>
          <div className="rounded-xl bg-surface-raised/80 px-4 py-3">
            <p className="text-[11px] text-muted">Strongest area</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {insights.executive.strongest}
            </p>
          </div>
          <div className="rounded-xl bg-surface-raised/80 px-4 py-3">
            <p className="text-[11px] text-muted">Weakest area</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {insights.executive.weakest}
            </p>
          </div>
          <div className="rounded-xl bg-surface-raised/80 px-4 py-3">
            <p className="text-[11px] text-muted">Biggest opportunity</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {insights.executive.biggestOpportunity}
            </p>
          </div>
          <div className="rounded-xl border border-positive/25 bg-positive-soft/40 px-4 py-3">
            <p className="text-[11px] text-positive">Expected visibility lift</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              +{insights.executive.expectedLift}%
            </p>
          </div>
        </div>
      </section>

      {/* Wow spotlight */}
      {insights.spotlight ? (
        <section className="rounded-2xl border border-border/50 bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info">Prompt</Badge>
            <Badge>Confidence {insights.spotlight.confidence}%</Badge>
          </div>
          <p className="mt-3 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            “{insights.spotlight.prompt}”
          </p>
          <div className="my-5 h-px bg-border/70" />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.05fr]">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-accent" />
                <p className="text-sm font-semibold text-foreground">
                  {insights.spotlight.engineName}
                </p>
              </div>
              <ol className="mt-3 space-y-2">
                {insights.spotlight.ranking.map((name, index) => (
                  <li
                    key={name}
                    className="flex items-center justify-between rounded-xl bg-surface-raised/80 px-3 py-2.5 text-sm"
                  >
                    <span>
                      <span className="mr-2 tabular-nums text-muted">#{index + 1}</span>
                      <span className="font-medium text-foreground">{name}</span>
                    </span>
                    <Badge tone="positive">Recommended</Badge>
                  </li>
                ))}
              </ol>
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-negative/25 bg-negative-soft/40 px-3 py-3">
                <XCircle className="mt-0.5 size-4 shrink-0 text-negative" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {result.brand || "Your brand"} not mentioned
                  </p>
                  <p className="mt-1 text-xs text-muted-strong">
                    Estimated visibility gain{" "}
                    <span className="font-semibold text-positive">
                      +{insights.spotlight.estimatedGain}%
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-surface-raised/60 p-4">
              <p className="text-xs font-medium tracking-wide text-muted uppercase">Reason</p>
              <ul className="mt-3 space-y-2">
                {insights.spotlight.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2 text-sm text-foreground">
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-warning" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {/* Competitor wins + brand understanding */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prompt winners</CardTitle>
            <CardDescription>Who AI recommended first — story over scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border/50">
              <div className="grid grid-cols-[1.4fr_0.8fr] gap-2 border-b border-border/50 bg-surface-raised/50 px-3 py-2 text-[11px] font-medium tracking-wide text-muted uppercase">
                <span>Prompt</span>
                <span>Winner</span>
              </div>
              {insights.promptWinners.map((row) => (
                <button
                  key={row.prompt}
                  type="button"
                  onClick={() => setActivePrompt(row.prompt)}
                  className="grid w-full grid-cols-[1.4fr_0.8fr] gap-2 border-b border-border/40 px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-surface-hover/60 cursor-pointer"
                >
                  <span className="truncate text-muted-strong">{row.prompt}</span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    {row.winner}
                    {row.brandWon ? <Badge tone="positive">You</Badge> : null}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How AI understands your brand</CardTitle>
            <CardDescription>
              Associations engines lean on for {insights.brandUnderstanding.brand}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted">Associated with</p>
              <ul className="mt-2 space-y-1.5">
                {insights.brandUnderstanding.strong.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="size-4 text-positive" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Weak associations</p>
              <ul className="mt-2 space-y-1.5">
                {insights.brandUnderstanding.weak.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <XCircle className="size-4 text-negative" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fix queue */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Fix queue</h2>
            <p className="mt-1 text-sm text-muted-strong">
              High-impact actions first — evidence-backed, with confidence.
            </p>
          </div>
          <Link href="/opportunities">
            <Badge tone="accent" className="cursor-pointer">
              Full backlog
            </Badge>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {insights.fixQueue.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border/50 bg-surface p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone={item.impact === "High" ? "positive" : "info"}>
                  {item.impact} impact
                </Badge>
                <div className="flex items-center gap-2">
                  <Stars count={item.stars} />
                  <Badge>Priority #{item.priority}</Badge>
                </div>
              </div>
              <p className="mt-3 text-base font-semibold text-foreground">{item.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-strong">
                <span className="font-medium text-foreground">Evidence · </span>
                {item.evidence}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg bg-surface-raised/80 px-3 py-2">
                  <p className="text-[10px] text-muted">Expected lift</p>
                  <p className="text-sm font-semibold text-positive">+{item.expectedLift}%</p>
                </div>
                <div className="rounded-lg bg-surface-raised/80 px-3 py-2">
                  <p className="text-[10px] text-muted">Time</p>
                  <p className="text-sm font-semibold text-foreground">{item.time}</p>
                </div>
                <div className="rounded-lg bg-surface-raised/80 px-3 py-2">
                  <p className="text-[10px] text-muted">Difficulty</p>
                  <p className="text-sm font-semibold text-foreground">{item.difficulty}</p>
                </div>
                <div className="rounded-lg bg-surface-raised/80 px-3 py-2">
                  <p className="text-[10px] text-muted">Confidence</p>
                  <p className="text-sm font-semibold text-foreground">{item.confidence}%</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted">
                Affected prompts · {item.affectedPrompts}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Response Explorer */}
      <section className="rounded-2xl border border-border/50 bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <MessageCircle className="size-4 text-accent-strong" />
          <h2 className="text-xl font-semibold text-foreground">AI Response Explorer</h2>
          <Badge tone="accent">Prompt-level</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-strong">
          Click a prompt to compare ChatGPT, Gemini, Claude, and more — with rankings, mentions,
          and why competitors won.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {insights.explorer.map((item) => (
            <button
              key={item.prompt}
              type="button"
              onClick={() => setActivePrompt(item.prompt)}
              className={cn(
                "max-w-full truncate rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer",
                activeExplorer?.prompt === item.prompt
                  ? "border-accent/50 bg-accent-soft text-accent-strong"
                  : "border-border bg-surface-raised text-muted-strong hover:text-foreground",
              )}
            >
              {item.prompt}
            </button>
          ))}
        </div>

        {activeExplorer ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm font-medium text-foreground">“{activeExplorer.prompt}”</p>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {activeExplorer.engines.map((engine) => (
                <div
                  key={`${activeExplorer.prompt}-${engine.engineId}`}
                  className="rounded-xl border border-border/50 bg-surface-raised/50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: engine.color }}
                    />
                    <p className="text-sm font-semibold text-foreground">{engine.engineName}</p>
                    <Badge tone={engine.brandMentioned ? "positive" : "warning"}>
                      {engine.brandMentioned
                        ? `Mentioned${engine.brandPosition ? ` · #${engine.brandPosition}` : ""}`
                        : "Not mentioned"}
                    </Badge>
                  </div>
                  {engine.ranking.length ? (
                    <ol className="mt-3 space-y-1">
                      {engine.ranking.map((name, index) => (
                        <li key={name} className="text-sm text-muted-strong">
                          <span className="tabular-nums text-muted">{index + 1}.</span>{" "}
                          <span
                            className={cn(
                              name.toLowerCase() === result.brand.toLowerCase() &&
                                "font-semibold text-accent-strong",
                            )}
                          >
                            {name}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  <p className="mt-3 text-xs leading-relaxed text-muted-strong">{engine.text}</p>
                  <p className="mt-2 text-[11px] text-muted">
                    <span className="font-medium text-foreground">Why · </span>
                    {engine.whyWinner}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Compact metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/40 bg-surface px-4 py-3">
          <p className="text-[11px] text-muted">Mention rate</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {result.brand ? `${result.mentionRate}%` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-surface px-4 py-3">
          <p className="text-[11px] text-muted">Mentions</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {result.mentionCount}/{result.totalAnswers}
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-surface px-4 py-3">
          <p className="text-[11px] text-muted">Avg. position</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {result.avgPosition ? `#${result.avgPosition}` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-surface px-4 py-3">
          <p className="text-[11px] text-muted">Query cost</p>
          <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold text-foreground">
            <Coins className="size-4 text-muted" />
            {formatCost(result.cost?.totalUsd ?? 0)}
          </p>
        </div>
      </div>

      {result.byEngine.length ? (
        <Card>
          <CardHeader>
            <CardTitle>By engine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.byEngine.map((engine) => (
              <div key={engine.engineId} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: engine.color }} />
                    <span className="font-medium text-foreground">{engine.engineName}</span>
                  </div>
                  <span className="tabular-nums text-muted">
                    {result.brand
                      ? `${engine.mentions}/${engine.answers} · ${engine.mentionRate}%`
                      : `${engine.answers} answers`}
                  </span>
                </div>
                <ProgressBar
                  value={result.brand ? engine.mentionRate : 100}
                  color={engine.color}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <LookupChatPanel context={chatContext} />

      {result.evidenceMap ? (
        <details className="rounded-xl border border-border/50 bg-surface">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-foreground">
            <span className="inline-flex items-center gap-2">
              <GitBranch className="size-4 text-accent-strong" />
              Fan-out evidence map
            </span>
          </summary>
          <div className="space-y-3 border-t border-border px-5 py-4">
            <p className="text-sm text-muted-strong">{result.evidenceMap.insight}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg bg-surface-raised px-3 py-2 text-xs">
                Fan-outs · {result.evidenceMap.fanouts}
              </div>
              <div className="rounded-lg bg-surface-raised px-3 py-2 text-xs">
                Evidence · {result.evidenceMap.evidenceShare}%
              </div>
              <div className="rounded-lg bg-surface-raised px-3 py-2 text-xs">
                Navigational · {result.evidenceMap.navigationalShare}%
              </div>
              <div className="rounded-lg bg-surface-raised px-3 py-2 text-xs">
                Brand-check wins · {result.evidenceMap.brandWinsNavigational}/
                {result.evidenceMap.brandInNavigationalQueries || "—"}
              </div>
            </div>
          </div>
        </details>
      ) : null}

      {result.faqs?.length ? (
        <details className="rounded-xl border border-border/50 bg-surface">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-foreground">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="size-4 text-accent-strong" />
              FAQs from this run
            </span>
          </summary>
          <div className="space-y-3 border-t border-border px-5 py-4">
            {result.faqs.map((faq) => (
              <div key={faq.question} className="rounded-lg bg-surface-raised p-3">
                <p className="text-sm font-medium text-foreground">{faq.question}</p>
                <p className="mt-1 text-sm text-muted-strong">{faq.answer}</p>
                <p className="mt-1 text-[11px] text-muted">
                  Confidence {Math.round(faq.confidence * 100)}%
                </p>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </motion.div>
  );
}
