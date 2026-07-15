"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Eye,
  ListOrdered,
  Loader2,
  Percent,
  Search,
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
import { readProviderKeys } from "@/lib/keys";

type LookupResponse = {
  mode: "demo" | "hybrid";
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

export function LookupClient({
  initialBrand = "",
  initialCategory = "",
}: {
  initialBrand?: string;
  initialCategory?: string;
}) {
  const [brand, setBrand] = useState(initialBrand);
  const [category, setCategory] = useState(initialCategory);
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runLookup = (nextBrand = brand, nextCategory = category) => {
    const trimmedBrand = nextBrand.trim();
    const trimmedCategory = nextCategory.trim();
    if (trimmedBrand.length < 2 && trimmedCategory.length < 2) {
      setError("Enter a brand (e.g. Pedigree) and/or a category (e.g. dogs, pets).");
      return;
    }

    setBrand(trimmedBrand);
    setCategory(trimmedCategory);
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/v1/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: trimmedBrand,
            category: trimmedCategory,
            promptLimit: 6,
            keys: readProviderKeys(),
          }),
        });
        const payload = (await response.json()) as LookupResponse & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Lookup failed");
        setResult(payload);
      } catch (err) {
        setResult(null);
        setError(err instanceof Error ? err.message : "Lookup failed");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand & category lookup"
        description="Look up any brand (Pedigree, Chewy) or a category (pets, dogs, dog food) and see how often names appear across answer engines."
      />

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <form
            className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              runLookup();
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
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              {isPending ? "Looking up…" : "Look up"}
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => runLookup(example.brand, example.category)}
                className="rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-muted-strong transition-colors hover:border-accent/40 hover:text-foreground cursor-pointer"
              >
                {example.label}
              </button>
            ))}
          </div>

          {error ? (
            <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {!result && !isPending ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState
              icon={Search}
              title="Try a brand or a category"
              description="Examples: Pedigree + dog food, Chewy + pets, or just “dogs” / “pets” to see which brands dominate AI answers in that category."
            />
          </motion.div>
        ) : null}

        {isPending ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="flex items-center justify-center gap-3 py-16 text-sm text-muted">
              <Loader2 className="size-5 animate-spin text-accent-strong" />
              Generating category prompts and counting mentions across engines…
            </Card>
          </motion.div>
        ) : null}

        {result && !isPending ? (
          <motion.div
            key={`${result.brand}-${result.category}-${result.mentionCount}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{result.mode === "hybrid" ? "Hybrid live + demo" : "Demo engines"}</Badge>
              <Badge tone="info">{result.category}</Badge>
              {result.brand ? <Badge>{result.brand}</Badge> : <Badge>Category scan</Badge>}
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
                hint={result.brand ? `${result.brand} inclusion` : "Pick a brand to score rate"}
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
                  <CardDescription>
                    Brands appearing in {result.category} answers
                  </CardDescription>
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
                      <ProgressBar value={item.share} />
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
                  Generated prompts for {result.category}
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
