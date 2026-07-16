"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Coins,
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
import { LookupChatPanel } from "@/components/lookup/lookup-chat-panel";
import { readProviderKeys, saveLastLookup, type StoredProviderId } from "@/lib/keys";
import { cn } from "@/lib/utils";
import type { LookupChatContext } from "@/lib/agents/chat-agent";
import { BRAND } from "@/lib/demo-data";

type LookupMode = "live" | "demo";

type LookupResponse = {
  mode: LookupMode;
  liveEngines?: string[];
  failedEngines?: string[];
  providerErrors?: Record<string, string>;
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
  { label: "Peacock", brand: "Peacock", category: "OTT streaming" },
  { label: "Netflix", brand: "Netflix", category: "OTT streaming" },
  { label: "Best OTT", brand: "", category: "best OTT platform" },
  { label: "Hulu", brand: "Hulu", category: "streaming" },
  { label: "Chewy", brand: "Chewy", category: "pets" },
  { label: "Pedigree", brand: "Pedigree", category: "dog food" },
];

const DEMO_DEFAULTS = { brand: "Peacock", category: "OTT streaming" };

const PROVIDER_LABELS: Record<StoredProviderId, string> = {
  openai: "ChatGPT",
  anthropic: "Claude",
  google: "Gemini",
  xai: "Grok",
  perplexity: "Perplexity",
};

function toChatContext(result: LookupResponse): LookupChatContext {
  return {
    brand: result.brand,
    category: result.category,
    mode: result.mode,
    mentionCount: result.mentionCount,
    totalAnswers: result.totalAnswers,
    mentionRate: result.mentionRate,
    avgPosition: result.avgPosition,
    shareOfVoice: result.shareOfVoice,
    byEngine: result.byEngine.map((engine) => ({
      engineName: engine.engineName,
      mentions: engine.mentions,
      answers: engine.answers,
      mentionRate: engine.mentionRate,
      avgPosition: engine.avgPosition,
    })),
    faqs: result.faqs?.map((faq) => ({ question: faq.question, answer: faq.answer })),
    appearances: result.appearances,
    evidenceMap: result.evidenceMap
      ? {
          fanouts: result.evidenceMap.fanouts,
          evidenceShare: result.evidenceMap.evidenceShare,
          navigationalShare: result.evidenceMap.navigationalShare,
          brandInNavigationalQueries: result.evidenceMap.brandInNavigationalQueries,
          brandWinsNavigational: result.evidenceMap.brandWinsNavigational,
          insight: result.evidenceMap.insight,
        }
      : undefined,
    results: result.results.map((row) => ({
      prompt: row.prompt,
      engineName: row.engineName,
      brandMentioned: row.brandMentioned,
      brandPosition: row.brandPosition,
      text: row.text,
      mentionedNames: row.mentionedNames,
    })),
    intentCounts: result.intentCounts,
  };
}

function formatCost(usd: number) {
  if (usd <= 0) return "$0.00";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(3)}`;
}

export function LookupClient({
  initialBrand = "",
  initialCategory = "",
}: {
  initialBrand?: string;
  initialCategory?: string;
}) {
  const [brand, setBrand] = useState(initialBrand || DEMO_DEFAULTS.brand);
  const [category, setCategory] = useState(initialCategory || DEMO_DEFAULTS.category);
  const [mode, setMode] = useState<LookupMode>("demo");
  const [configuredProviders, setConfiguredProviders] = useState<StoredProviderId[]>([]);
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsTopRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const skipNextDemoDebounce = useRef(false);
  const brandRef = useRef(brand);
  const categoryRef = useRef(category);
  const modeRef = useRef(mode);
  brandRef.current = brand;
  categoryRef.current = category;
  modeRef.current = mode;

  const chatContext = useMemo(() => (result ? toChatContext(result) : null), [result]);

  const refreshKeys = useCallback(() => {
    const keys = readProviderKeys();
    setConfiguredProviders(
      (Object.keys(keys) as StoredProviderId[]).filter((id) => Boolean(keys[id])),
    );
  }, []);

  useEffect(() => {
    refreshKeys();
  }, [refreshKeys]);

  const runLookup = useCallback(async (
    nextBrand?: string,
    nextCategory?: string,
    nextMode?: LookupMode,
  ) => {
    const trimmedBrand = (nextBrand ?? brandRef.current).trim();
    const trimmedCategory = (nextCategory ?? categoryRef.current).trim();
    const resolvedMode = nextMode ?? modeRef.current;

    if (trimmedBrand.length < 2 && trimmedCategory.length < 2) {
      setError("Enter a brand (e.g. Peacock) and/or a category (e.g. OTT streaming).");
      return;
    }

    const keys = resolvedMode === "live" ? readProviderKeys() : {};
    const providers =
      resolvedMode === "live"
        ? (Object.keys(keys) as StoredProviderId[]).filter((id) => Boolean(keys[id]))
        : [];
    if (resolvedMode === "live") setConfiguredProviders(providers);

    if (resolvedMode === "live" && providers.length === 0) {
      setError("Live mode needs API keys. Add them in Settings, or switch to Demo mode.");
      setResult(null);
      return;
    }

    setBrand(trimmedBrand);
    setCategory(trimmedCategory);
    setMode(resolvedMode);
    setError(null);
    setIsLoading(true);
    const requestId = ++requestIdRef.current;

    try {
      const response = await fetch("/api/v1/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: trimmedBrand,
          category: trimmedCategory,
          mode: resolvedMode,
          promptLimit: resolvedMode === "live" ? 4 : 6,
          // Demo never sends API keys.
          keys: resolvedMode === "live" ? keys : {},
        }),
      });
      const payload = (await response.json()) as LookupResponse & {
        error?: string;
        code?: string;
      };
      if (requestId !== requestIdRef.current) return;
      if (!response.ok) throw new Error(payload.error ?? "Lookup failed");
      setResult(payload);
      saveLastLookup({
        brand: payload.brand || trimmedBrand,
        category: payload.category || trimmedCategory,
        mode: resolvedMode,
      });
      // Keep the user at the top of results (stats), not scrolled into fan-out/chat.
      requestAnimationFrame(() => {
        resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setResult(null);
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  // Auto-run demo on first mount.
  useEffect(() => {
    skipNextDemoDebounce.current = true;
    void runLookup(DEMO_DEFAULTS.brand, DEMO_DEFAULTS.category, "demo");
  }, [runLookup]);

  // When brand/category change in demo mode, re-run automatically (debounced).
  useEffect(() => {
    if (mode !== "demo") return;
    if (skipNextDemoDebounce.current) {
      skipNextDemoDebounce.current = false;
      return;
    }
    const trimmedBrand = brand.trim();
    const trimmedCategory = category.trim();
    if (trimmedBrand.length < 2 && trimmedCategory.length < 2) return;

    const timer = window.setTimeout(() => {
      void runLookup(trimmedBrand, trimmedCategory, "demo");
    }, 550);
    return () => window.clearTimeout(timer);
  }, [brand, category, mode, runLookup]);

  const selectMode = (nextMode: LookupMode) => {
    setError(null);
    if (nextMode === "demo") {
      const nextBrand = brand.trim() || DEMO_DEFAULTS.brand;
      const nextCategory = category.trim() || DEMO_DEFAULTS.category;
      skipNextDemoDebounce.current = true;
      setMode("demo");
      setBrand(nextBrand);
      setCategory(nextCategory);
      void runLookup(nextBrand, nextCategory, "demo");
      return;
    }
    setMode("live");
    setResult(null);
    refreshKeys();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand & category lookup"
        description="Demo runs sample answers with no API keys. Live queries only the engines you’ve configured."
      />

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Data source</p>
              <div className="mt-1.5 inline-flex rounded-lg border border-border bg-surface-raised p-1">
                <button
                  type="button"
                  onClick={() => selectMode("live")}
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
                  onClick={() => selectMode("demo")}
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
                  Demo uses sample answers only — API keys are ignored.
                </span>
              )}
            </div>
          </div>

          <form
            className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              skipNextDemoDebounce.current = true;
              void runLookup();
            }}
          >
            <div className="relative">
              <Building2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                placeholder="Brand — Peacock, Netflix, Chewy…"
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
                  : "Updating demo…"
                : mode === "live"
                  ? "Look up live"
                  : "Run demo"}
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => {
                  skipNextDemoDebounce.current = true;
                  void runLookup(example.brand, example.category, mode);
                }}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  brand === example.brand && category === example.category
                    ? "border-accent/50 bg-accent-soft text-accent-strong"
                    : "border-border bg-surface-raised text-muted-strong hover:border-accent/40 hover:text-foreground",
                )}
              >
                {example.label}
              </button>
            ))}
          </div>

          {mode === "demo" ? (
            <p className="text-[11px] text-muted">
              Demo re-runs automatically when you change brand or category.
            </p>
          ) : null}

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
              title={mode === "live" ? "Run a live brand or category lookup" : "Preparing demo…"}
              description={
                mode === "live"
                  ? "Stats → fan-out → FAQs → chat. Live mode uses only your configured keys."
                  : "Demo mode loads sample Peacock answers with no API keys."
              }
            />
          </motion.div>
        ) : null}

        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="space-y-4 p-6">
              <div className="flex items-center gap-3 text-sm text-muted">
                <Loader2 className="size-5 animate-spin text-accent-strong" />
                {mode === "live"
                  ? "Asking live answer engines and measuring mentions…"
                  : "Generating demo answers — no API keys used…"}
              </div>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="skeleton h-24 rounded-xl" />
                ))}
              </div>
            </Card>
          </motion.div>
        ) : null}

        {result && !isLoading && chatContext ? (
          <motion.div
            key={`${result.mode}-${result.brand}-${result.category}-${result.mentionCount}-${result.totalAnswers}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
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
            </div>

            {result.providerErrors && Object.keys(result.providerErrors).length > 0 ? (
              <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
                {Object.entries(result.providerErrors).map(([engine, message]) => (
                  <p key={engine} className="leading-relaxed">
                    <span className="font-semibold">{engine}:</span> {message}
                  </p>
                ))}
              </div>
            ) : null}

            {result.brand &&
            result.brand.toLowerCase() !== BRAND.name.toLowerCase() ? (
              <div className="rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-xs leading-relaxed text-muted-strong">
                Looking up <span className="font-medium text-foreground">{result.brand}</span>.
                Dashboard & Competitors still show the{" "}
                <span className="font-medium text-foreground">{BRAND.name}</span> demo workspace —{" "}
                <Link href="/competitors" className="font-semibold text-accent-strong hover:underline">
                  open Competitors
                </Link>{" "}
                for that sample landscape, or keep using lookup for {result.brand}.
              </div>
            ) : null}

            {/* 1. Stats — including measured query cost */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
              <StatCard
                label="Query cost"
                value={formatCost(result.cost?.totalUsd ?? 0)}
                hint={
                  result.mode === "demo"
                    ? "Measured metric · demo is $0 (no provider calls)"
                    : "Measured from estimated tokens × public list prices"
                }
                icon={Coins}
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

            {/* 2. Fan-out early — right after stats */}
            {result.evidenceMap ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="size-4 text-accent-strong" />
                    Fan-out evidence map
                  </CardTitle>
                  <CardDescription>
                    After commercial prompts, engines expand into informational proof and navigational
                    brand-checks before recommending
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
                      .slice(0, 2)
                      .map((root) => {
                        const children = result.evidenceMap!.nodes.filter(
                          (node) => node.parentId === root.id,
                        );
                        return (
                          <div
                            key={root.id}
                            className="rounded-lg border border-border bg-surface-raised p-4"
                          >
                            <Badge tone="accent">Commercial root</Badge>
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
                                    {child.brandMentioned === true ? (
                                      <Badge tone="positive">Mentioned</Badge>
                                    ) : child.brandMentioned === false ? (
                                      <Badge tone="warning">Missed</Badge>
                                    ) : null}
                                  </div>
                                  <p className="text-sm text-foreground">{child.query}</p>
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

            {/* 3. FAQs + appearance context */}
            {result.faqs?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>FAQs people ask</CardTitle>
                  <CardDescription>
                    Plain-language answers about inclusion, competitors, and where{" "}
                    {result.brand || "brands"} show up
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.faqs.map((faq) => (
                    <div
                      key={faq.question}
                      className="rounded-lg border border-border bg-surface-raised p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{faq.question}</p>
                        {faq.kind ? (
                          <Badge tone="info" className="capitalize">
                            {faq.kind}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-strong">{faq.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {result.appearances?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Where the brand shows up</CardTitle>
                  <CardDescription>
                    Prompt + engine contexts with mentions and gaps from this run
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {result.appearances.map((item, index) => (
                    <div
                      key={`${item.kind}-${item.engineName}-${index}`}
                      className="rounded-lg border border-border bg-surface-raised p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={item.kind === "mentioned" ? "positive" : "warning"}>
                          {item.kind === "mentioned" ? "Mentioned" : "Missed"}
                        </Badge>
                        <Badge>{item.engineName}</Badge>
                        {item.position ? <Badge tone="info">#{item.position}</Badge> : null}
                        {item.peers.slice(0, 2).map((peer) => (
                          <Badge key={peer} tone="info">
                            {peer}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-2 text-sm font-medium text-foreground">{item.prompt}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-strong">
                        {item.snippet}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {/* 4. Chat */}
            <LookupChatPanel context={chatContext} />

            <details className="rounded-xl border border-border/60 bg-surface">
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-foreground">
                Answer samples & agent trace
              </summary>
              <div className="space-y-4 border-t border-border px-5 py-4">
                {(result.agentTrace?.length || result.intentCounts) && (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {result.intentCounts ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Intent mix</CardTitle>
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
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {result.agentTrace.slice(-8).map((event, index) => (
                            <div
                              key={`${event.at}-${index}`}
                              className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs text-muted-strong"
                            >
                              <span className="font-semibold capitalize text-foreground">
                                {event.agent}
                              </span>
                              {" · "}
                              {event.message}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Answer sample</CardTitle>
                    <CardDescription>
                      {result.mode === "live" ? "Live" : "Demo"} answers for {result.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.results.slice(0, 8).map((item, index) => (
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
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground">{item.prompt}</p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-strong">{item.text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </details>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
