"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  KeyRound,
  Loader2,
  Radio,
  Search,
  Sparkles,
  Tags,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LookupResults } from "@/components/lookup/lookup-results";
import { readProviderKeys, saveLastLookup, type StoredProviderId } from "@/lib/keys";
import { cn } from "@/lib/utils";
import type { LookupChatContext } from "@/lib/agents/chat-agent";

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
          <LookupResults
            key={`${result.mode}-${result.brand}-${result.category}-${result.mentionCount}-${result.totalAnswers}`}
            result={result}
            chatContext={chatContext}
            resultsTopRef={resultsTopRef}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
