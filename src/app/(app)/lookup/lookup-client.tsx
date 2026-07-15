"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Eye,
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
};

const EXAMPLES = [
  { label: "Pedigree", brand: "Pedigree", category: "dog food" },
  { label: "Chewy", brand: "Chewy", category: "pets" },
  { label: "Pets", brand: "", category: "pets" },
  { label: "Dogs", brand: "", category: "dogs" },
  { label: "Dog food", brand: "", category: "dog food" },
  { label: "Purina", brand: "Purina", category: "pet food" },
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
      setError("Enter a brand (e.g. Pedigree) and/or a category (e.g. dogs, pets).");
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
                placeholder="Brand — Pedigree, Chewy, Purina…"
                className="h-11 w-full rounded-lg border border-border bg-surface-raised pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                aria-label="Brand name"
              />
            </div>
            <div className="relative">
              <Tags className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Category — pets, dogs, dog food…"
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
                  ? "Live mode queries only engines you’ve configured with API keys. Switch to Demo if you just want sample mention counts."
                  : "Demo mode generates illustrative answers for pets, dogs, Pedigree, Chewy, and similar queries without calling providers."
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
            </div>

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
