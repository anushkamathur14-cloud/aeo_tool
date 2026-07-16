"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Eye,
  GitBranch,
  KeyRound,
  ListOrdered,
  Loader2,
  Percent,
  Radio,
  Search,
  Sparkles,
  Tags,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { readProviderKeys, type StoredProviderId } from "@/lib/keys";
import { cn } from "@/lib/utils";

type LookupMode = "live" | "demo";

type LookupResponse = {
  mode: LookupMode;
  liveEngines?: string[];
  failedEngines?: string[];
  brand: string;
  category: string;
  totalAnswers: number;
  mentionCount: number;
  mentionRate: number;
  avgPosition: number | null;
  shareOfVoice: Array<{ name: string; count: number; share: number }>;
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
  cost?: {
    totalUsd: number;
    ledger: Array<{
      provider: string;
      model: string;
      promptTokensEst: number;
      completionTokensEst: number;
      costUsd: number;
    }>;
  };
  faqs?: Array<{ question: string; answer: string; confidence: number }>;
  intentCounts?: Record<string, number>;
  agentTrace?: Array<{ agent: string; at: string; message: string }>;
  evidenceMap?: {
    roots: number;
    fanouts: number;
    intentMix: Record<string, number>;
    evidenceShare: number;
    navigationalShare: number;
    brandInNavigationalQueries: number;
    brandWinsNavigational: number;
    brandWinsEvidence: number;
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
};

const EXAMPLES = [
  { label: "Streamora", brand: "Streamora", category: "OTT streaming" },
  { label: "Netflix", brand: "Netflix", category: "OTT streaming" },
  { label: "Best OTT", brand: "", category: "best OTT platform" },
  { label: "Hulu", brand: "Hulu", category: "streaming" },
  { label: "Chewy", brand: "Chewy", category: "pets" },
  { label: "Pedigree", brand: "Pedigree", category: "dog food" },
];

const PROVIDER_LABELS: Record<StoredProviderId, string> = {
  openai: "ChatGPT",
  anthropic: "Claude",
  google: "Gemini",
  xai: "Grok",
  perplexity: "Perplexity",
};

export function LookupClient({
  initialBrand = "",
  initialCategory = "",
}: {
  initialBrand?: string;
  initialCategory?: string;
}) {
  const [brand, setBrand] = useState(initialBrand);
  const [category, setCategory] = useState(initialCategory);
  const [mode, setMode] = useState<LookupMode>("live");
  const [configuredProviders, setConfiguredProviders] = useState<StoredProviderId[]>([]);
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const keys = readProviderKeys();
    setConfiguredProviders(
      (Object.keys(keys) as StoredProviderId[]).filter((id) => Boolean(keys[id])),
    );
  }, []);

  const refreshKeys = () => {
    const keys = readProviderKeys();
    setConfiguredProviders(
      (Object.keys(keys) as StoredProviderId[]).filter((id) => Boolean(keys[id])),
    );
  };

  const runLookup = async (nextBrand = brand, nextCategory = category, nextMode = mode) => {
    const trimmedBrand = nextBrand.trim();
    const trimmedCategory = nextCategory.trim();
    if (trimmedBrand.length < 2 && trimmedCategory.length < 2) {
      setError("Enter a brand (e.g. Streamora) and/or a category (e.g. OTT streaming).");
      return;
    }

    const keys = readProviderKeys();
    const providers = (Object.keys(keys) as StoredProviderId[]).filter((id) => Boolean(keys[id]));
    setConfiguredProviders(providers);

    if (nextMode === "live" && providers.length === 0) {
      setError("Live mode needs API keys. Add them in Settings, or switch to Demo mode.");
      setResult(null);
      return;
    }

    setBrand(trimmedBrand);
    setCategory(trimmedCategory);
    setMode(nextMode);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: trimmedBrand,
          category: trimmedCategory,
          mode: nextMode,
          promptLimit: nextMode === "live" ? 4 : 6,
          keys: nextMode === "live" ? keys : {},
        }),
      });
      const payload = (await response.json()) as LookupResponse & {
        error?: string;
        code?: string;
      };
      if (!response.ok) throw new Error(payload.error ?? "Lookup failed");
      setResult(payload);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand & category lookup"
        description="Live lookups query your configured answer engines. Demo mode is optional sample data only when you choose it."
      />

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Data source</p>
              <div className="mt-1.5 inline-flex rounded-lg border border-border bg-surface-raised p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("live");
                    setResult(null);
                    setError(null);
                    refreshKeys();
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    mode === "live"
                      ? "bg-accent-soft text-accent-strong"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <Radio className="size-3.5" />
                  Live
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("demo");
                    setResult(null);
                    setError(null);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    mode === "demo"
                      ? "bg-accent-soft text-accent-strong"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <Sparkles className="size-3.5" />
                  Demo
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs text-muted-strong">
              {mode === "live" ? (
                configuredProviders.length > 0 ? (
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    <KeyRound className="size-3.5 text-positive" />
                    Live engines ready:{" "}
                    {configuredProviders.map((id) => PROVIDER_LABELS[id]).join(", ")}
                  </span>
                ) : (
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <KeyRound className="size-3.5 text-warning" />
                    No API keys yet.
                    <Link href="/settings" className="font-semibold text-accent-strong hover:underline">
                      Add keys in Settings
                    </Link>
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-accent-strong" />
                  Demo mode uses sample answers only — not live model data.
                </span>
              )}
            </div>
          </div>

          <form
            className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void runLookup();
            }}
          >
            <div className="relative">
              <Building2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                placeholder="Brand — Streamora, Netflix, Chewy…"
                className="h-11 w-full rounded-lg border border-border bg-surface-raised pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                aria-label="Brand name"
              />
            </div>
            <div className="relative">
              <Tags className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Category — OTT streaming, pets, dog food…"
                className="h-11 w-full rounded-lg border border-border bg-surface-raised pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                aria-label="Category"
              />
            </div>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              {isLoading
                ? mode === "live"
                  ? "Querying live…"
                  : "Running demo…"
                : mode === "live"
                  ? "Look up live"
                  : "Look up demo"}
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => void runLookup(example.brand, example.category, mode)}
                className="rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-muted-strong transition-colors hover:border-accent/40 hover:text-foreground cursor-pointer"
              >
                {example.label}
              </button>
            ))}
          </div>

          {error ? (
            <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
              {error}{" "}
              {mode === "live" ? (
                <Link href="/settings" className="font-semibold underline underline-offset-2">
                  Open Settings
                </Link>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {!result && !isLoading ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState
              icon={Search}
              title={mode === "live" ? "Run a live brand or category lookup" : "Run a demo lookup"}
              description={
                mode === "live"
                  ? "Live mode runs Query → Evaluation → Classification → Fan-out → FAQ against your keyed engines."
                  : "Demo mode runs the same agent pipeline on realistic OTT/streaming sample answers (Streamora, Netflix, Hulu, etc.)."
              }
            />
          </motion.div>
        ) : null}

        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="flex items-center justify-center gap-3 py-16 text-sm text-muted">
              <Loader2 className="size-5 animate-spin text-accent-strong" />
              {mode === "live"
                ? "Asking live answer engines and counting brand mentions…"
                : "Generating demo answers and counting mentions…"}
            </Card>
          </motion.div>
        ) : null}

        {result && !isLoading ? (
          <motion.div
            key={`${result.mode}-${result.brand}-${result.category}-${result.mentionCount}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={result.mode === "live" ? "positive" : "accent"}>
                {result.mode === "live" ? "Live data" : "Demo data"}
              </Badge>
              <Badge tone="info">{result.category}</Badge>
              {result.brand ? <Badge>{result.brand}</Badge> : <Badge>Category scan</Badge>}
              {result.liveEngines?.length ? (
                <Badge>Engines: {result.liveEngines.join(", ")}</Badge>
              ) : null}
              {result.failedEngines?.length ? (
                <Badge tone="warning">Failed: {result.failedEngines.join(", ")}</Badge>
              ) : null}
              {typeof result.cost?.totalUsd === "number" ? (
                <Badge tone="info">Est. cost ${result.cost.totalUsd.toFixed(4)}</Badge>
              ) : null}
            </div>

            {result.evidenceMap ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="size-4 text-accent-strong" />
                    Fan-out evidence map
                  </CardTitle>
                  <CardDescription>
                    Commercial prompts expand into informational proof and navigational brand-checks
                    before engines recommend — recommendation beats citation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border border-border bg-surface-raised p-3">
                      <p className="text-[11px] text-muted">Fan-outs</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                        {result.evidenceMap.fanouts}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-raised p-3">
                      <p className="text-[11px] text-muted">Evidence share</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                        {result.evidenceMap.evidenceShare}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-raised p-3">
                      <p className="text-[11px] text-muted">Navigational share</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                        {result.evidenceMap.navigationalShare}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-raised p-3">
                      <p className="text-[11px] text-muted">Brand-check wins</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                        {result.evidenceMap.brandWinsNavigational}/
                        {result.evidenceMap.brandInNavigationalQueries || "—"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-strong">
                    {result.evidenceMap.insight}
                  </p>

                  <div className="space-y-3">
                    {result.evidenceMap.nodes
                      .filter((node) => node.role === "root")
                      .map((root) => {
                        const children = result.evidenceMap!.nodes.filter(
                          (node) => node.parentId === root.id,
                        );
                        return (
                          <div
                            key={root.id}
                            className="rounded-lg border border-border bg-surface-raised p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge tone="accent">Commercial root</Badge>
                              {root.brandInQuery ? <Badge tone="info">Brand in query</Badge> : null}
                            </div>
                            <p className="mt-2 text-sm font-medium text-foreground">{root.query}</p>
                            <div className="mt-3 space-y-2 border-l border-border pl-3">
                              {children.map((child) => (
                                <div key={child.id} className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge
                                      tone={
                                        child.intent === "navigational" ? "warning" : "info"
                                      }
                                    >
                                      {child.intent}
                                    </Badge>
                                    {child.brandInQuery ? (
                                      <Badge>Brand in fan-out</Badge>
                                    ) : null}
                                    {child.brandMentioned === true ? (
                                      <Badge tone="positive">Mentioned</Badge>
                                    ) : child.brandMentioned === false ? (
                                      <Badge tone="warning">Missed</Badge>
                                    ) : null}
                                  </div>
                                  <p className="text-sm text-foreground">{child.query}</p>
                                  <p className="text-[11px] text-muted">{child.note}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {result.faqs?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>FAQ agent</CardTitle>
                  <CardDescription>Plain-language answers from this lookup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.faqs.map((faq) => (
                    <div
                      key={faq.question}
                      className="rounded-lg border border-border bg-surface-raised p-4"
                    >
                      <p className="text-sm font-medium text-foreground">{faq.question}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-strong">{faq.answer}</p>
                      <p className="mt-2 text-[11px] text-muted">
                        Confidence {(faq.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {(result.agentTrace?.length || result.intentCounts) && (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {result.intentCounts ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Classification agent</CardTitle>
                      <CardDescription>Intent mix across evaluated answers</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {Object.entries(result.intentCounts).map(([intent, count]) => (
                        <Badge key={intent} tone="accent">
                          {intent}: {count}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                ) : null}
                {result.agentTrace?.length ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Agent trace</CardTitle>
                      <CardDescription>Query → Evaluation → Classification → Fan-out → FAQ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.agentTrace.slice(-8).map((event, index) => (
                        <div
                          key={`${event.at}-${index}`}
                          className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs text-muted-strong"
                        >
                          <span className="font-semibold capitalize text-foreground">{event.agent}</span>
                          {" · "}
                          {event.message}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label={result.brand ? "Brand mentions" : "Answers scanned"}
                value={result.brand ? `${result.mentionCount}` : `${result.totalAnswers}`}
                hint={result.brand ? `of ${result.totalAnswers} answers` : "across engines"}
                icon={Eye}
              />
              <StatCard
                label="Mention rate"
                value={result.brand ? `${result.mentionRate}%` : "—"}
                hint={result.brand ? `${result.brand} inclusion` : "Add a brand to score rate"}
                icon={Percent}
              />
              <StatCard
                label="Avg. position"
                value={result.avgPosition ? `#${result.avgPosition}` : "—"}
                hint="when the brand is mentioned"
                icon={ListOrdered}
              />
              <StatCard
                label="Top mentioned"
                value={result.shareOfVoice[0]?.name ?? "—"}
                hint={
                  result.shareOfVoice[0]
                    ? `${result.shareOfVoice[0].count} answers · ${result.shareOfVoice[0].share}%`
                    : "No brands extracted"
                }
                icon={Building2}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Share of mentions</CardTitle>
                  <CardDescription>Brands appearing in {result.category} answers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.shareOfVoice.slice(0, 8).map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="tabular-nums text-muted">
                          {item.count} · {item.share}%
                        </span>
                      </div>
                      <ProgressBar value={Math.min(100, item.share)} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>By answer engine</CardTitle>
                  <CardDescription>
                    {result.brand
                      ? `${result.brand} mention rate per engine`
                      : "Answers generated per engine"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.byEngine.map((engine) => (
                    <div key={engine.engineId} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
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
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Answer sample</CardTitle>
                <CardDescription>
                  {result.mode === "live" ? "Live" : "Demo"} answers for {result.category}
                  {result.brand ? ` with focus on ${result.brand}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.results.slice(0, 12).map((item, index) => (
                  <div
                    key={`${item.engineId}-${index}`}
                    className="rounded-lg border border-border bg-surface-raised p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{item.engineName}</Badge>
                      {result.brand ? (
                        <Badge tone={item.brandMentioned ? "positive" : "warning"}>
                          {item.brandMentioned
                            ? `Mentioned${item.brandPosition ? ` · #${item.brandPosition}` : ""}`
                            : "Not mentioned"}
                        </Badge>
                      ) : null}
                      {item.mentionedNames.slice(0, 4).map((name) => (
                        <Badge key={name} tone="info">
                          {name}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">{item.prompt}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-strong">{item.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
