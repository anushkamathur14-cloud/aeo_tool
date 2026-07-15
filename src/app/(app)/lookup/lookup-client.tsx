"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Eye,
  ListOrdered,
  Percent,
  Search,
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
import { BRAND, COMPETITORS } from "@/lib/demo-data";
import { lookupBrandMentions } from "@/lib/brand-mentions";

const QUICK_BRANDS = [BRAND.name, ...COMPETITORS.map((competitor) => competitor.name)];

export function LookupClient({ initialBrand = "" }: { initialBrand?: string }) {
  const [query, setQuery] = useState(initialBrand);
  const [submitted, setSubmitted] = useState(initialBrand);
  const [isPending, startTransition] = useTransition();

  const summary = useMemo(() => lookupBrandMentions(submitted), [submitted]);

  const runLookup = (value: string) => {
    const next = value.trim();
    startTransition(() => {
      setQuery(next);
      setSubmitted(next);
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand mention lookup"
        description="Search any brand and see how often it appears in the latest scan answers across engines and prompt categories."
      />

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              runLookup(query);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try NovaCRM, HubSpot, Salesforce…"
                className="h-11 w-full rounded-lg border border-border bg-surface-raised pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                aria-label="Brand name"
              />
            </div>
            <Button type="submit" variant="primary" disabled={!query.trim() || isPending}>
              Look up mentions
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {QUICK_BRANDS.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => runLookup(brand)}
                className="rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-muted-strong transition-colors hover:border-accent/40 hover:text-foreground cursor-pointer"
              >
                {brand}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState
              icon={Search}
              title="Search a brand"
              description="Enter a company name to count mentions across ChatGPT, Claude, Perplexity, Gemini, and Copilot answers from the current demo scan."
            />
          </motion.div>
        ) : (
          <motion.div
            key={summary.brand}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Brand" value={summary.brand} icon={Building2} />
              <StatCard
                label="Mentions"
                value={`${summary.mentionCount}`}
                hint={`of ${summary.totalAnswers} answers`}
                icon={Eye}
              />
              <StatCard label="Mention rate" value={`${summary.mentionRate}%`} icon={Percent} />
              <StatCard
                label="Avg. position"
                value={summary.avgPosition ? `#${summary.avgPosition}` : "—"}
                hint="when mentioned"
                icon={ListOrdered}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>By answer engine</CardTitle>
                  <CardDescription>Where {summary.brand} shows up most often</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {summary.byEngine.map((engine) => (
                    <div key={engine.engineId} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ background: engine.color }}
                          />
                          <span className="font-medium text-foreground">{engine.engineName}</span>
                        </div>
                        <span className="tabular-nums text-muted">
                          {engine.mentions}/{engine.answers} · {engine.mentionRate}%
                        </span>
                      </div>
                      <ProgressBar value={engine.mentionRate} color={engine.color} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>By prompt category</CardTitle>
                  <CardDescription>Intent types driving the mentions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {summary.byCategory.map((category) => (
                    <div
                      key={category.category}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface-raised px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{category.category}</p>
                        <p className="text-xs text-muted">
                          {category.mentions} mentions across {category.answers} answers
                        </p>
                      </div>
                      <Badge tone="accent">{category.mentionRate}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Matching answers</CardTitle>
                <CardDescription>
                  {summary.hits.length
                    ? `${summary.hits.length} answer snippets that mention ${summary.brand}`
                    : `No mentions of ${summary.brand} in the current scan set`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.hits.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="No mentions found"
                    description="Try another brand, or run a scan after adding competitors in the Scanner."
                  />
                ) : (
                  summary.hits.map((hit, index) => (
                    <div
                      key={`${hit.promptId}-${hit.engineId}-${index}`}
                      className="rounded-lg border border-border bg-surface-raised p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{hit.engineName}</Badge>
                        <Badge tone="info">{hit.category}</Badge>
                        {hit.position ? <Badge tone="accent">#{hit.position}</Badge> : null}
                        <Badge
                          tone={
                            hit.sentiment === "positive"
                              ? "positive"
                              : hit.sentiment === "negative"
                                ? "warning"
                                : "default"
                          }
                        >
                          {hit.sentiment}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-medium text-foreground">{hit.promptText}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-strong">{hit.snippet}</p>
                      <Link
                        href={`/prompts/${hit.promptId}`}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-strong hover:underline"
                      >
                        Open prompt <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
