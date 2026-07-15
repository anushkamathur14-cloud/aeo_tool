"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, MessageSquareText, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Delta } from "@/components/ui/delta";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PROMPTS, type PromptCategory } from "@/lib/demo-data";
import { cn, formatDate } from "@/lib/utils";

const CATEGORIES: ("All" | PromptCategory)[] = [
  "All",
  "Best-of list",
  "Comparison",
  "Alternatives",
  "Pricing",
  "Use case",
  "How-to",
];

export function PromptsClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered = useMemo(() => {
    return PROMPTS.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (query && !p.text.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    }).sort((a, b) => b.volumeScore - a.volumeScore);
  }, [query, category]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prompts"
        description={`${PROMPTS.length} buyer questions tracked across 5 answer engines. Each prompt is a keyword-equivalent for the AI era.`}
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts…"
            className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                category === c
                  ? "bg-accent-soft text-accent-strong"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="No prompts match"
          description="Try a different search term or category filter."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((prompt) => (
            <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
              <Card className="group mb-2.5 flex flex-col gap-4 p-4 transition-colors hover:border-border-strong hover:bg-surface-raised sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {prompt.text}
                    </p>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge>{prompt.category}</Badge>
                    <SentimentBadge sentiment={prompt.sentiment} />
                    <span className="text-[11px] text-muted">
                      Last scanned {formatDate(prompt.lastScanned)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-6">
                  <div className="w-28">
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-muted">Mentions</span>
                      <span className="font-semibold text-foreground">
                        {prompt.mentionRate}%
                      </span>
                    </div>
                    <ProgressBar value={prompt.mentionRate} />
                  </div>
                  <div className="w-16 text-center">
                    <p className="text-[11px] text-muted">Position</p>
                    <p className="text-sm font-semibold text-foreground">
                      {prompt.avgPosition ? `#${prompt.avgPosition}` : "—"}
                    </p>
                  </div>
                  <div className="w-14 text-center">
                    <p className="text-[11px] text-muted">Trend</p>
                    <Delta value={prompt.trend} />
                  </div>
                  <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
