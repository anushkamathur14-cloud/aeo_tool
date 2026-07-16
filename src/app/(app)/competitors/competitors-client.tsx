"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Info, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Delta } from "@/components/ui/delta";
import { PageHeader } from "@/components/ui/page-header";
import { EngineBadge } from "@/components/ui/engine-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CompetitorTrendChart } from "@/components/charts/visibility-trend-chart";
import { ShareOfVoiceChart } from "@/components/charts/share-of-voice-chart";
import { BRAND, COMPETITORS } from "@/lib/demo-data";
import { readLastLookup, type LastLookup } from "@/lib/keys";
import { cn } from "@/lib/utils";

export function CompetitorsClient() {
  const sorted = [...COMPETITORS].sort((a, b) => b.shareOfVoice - a.shareOfVoice);
  const peacockRank = sorted.findIndex((c) => c.id === "peacock") + 1;
  const [lastLookup, setLastLookup] = useState<LastLookup | null>(null);

  useEffect(() => {
    setLastLookup(readLastLookup());
  }, []);

  const customBrand = lastLookup?.brand?.trim() ?? "";
  const isCustomBrand =
    customBrand.length >= 2 && customBrand.toLowerCase() !== BRAND.name.toLowerCase();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitors"
        description={`Demo competitive landscape for ${BRAND.name} vs Netflix, Prime Video, Hulu, Disney+, and Max. Share-of-voice rank in this sample: #${peacockRank} of ${sorted.length}.`}
        actions={<Badge tone="accent">Demo data</Badge>}
      />

      <div className="rounded-xl border border-accent/25 bg-accent-soft/50 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-2.5">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-accent-strong" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                This page is sample Peacock demo data
              </p>
              <p className="text-xs leading-relaxed text-muted-strong">
                Charts and rankings below are a fixed demo workspace for{" "}
                <span className="font-medium text-foreground">{BRAND.name}</span> (
                {BRAND.domain}). They do not update when you look up another brand.
              </p>
            </div>
          </div>
          <Link href={`/lookup?brand=${encodeURIComponent(BRAND.name)}&category=OTT%20streaming`}>
            <Button variant="secondary" size="sm">
              Open Peacock demo lookup <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {isCustomBrand ? (
        <div className="rounded-xl border border-info/30 bg-info-soft/40 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-info" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  You looked up {customBrand}
                  {lastLookup?.category ? ` · ${lastLookup.category}` : ""}
                </p>
                <p className="text-xs leading-relaxed text-muted-strong">
                  Competitor scores on this page are still the Peacock demo set — not a live
                  landscape for {customBrand}. To measure {customBrand} against peers, run Brand
                  lookup (Live with your keys, or Demo sample answers for that brand).
                </p>
              </div>
            </div>
            <Link
              href={`/lookup?brand=${encodeURIComponent(customBrand)}${
                lastLookup?.category
                  ? `&category=${encodeURIComponent(lastLookup.category)}`
                  : ""
              }`}
            >
              <Button variant="primary" size="sm">
                Look up {customBrand} <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Visibility trend vs competitors</CardTitle>
            <CardDescription>
              Demo weekly visibility score, 12 weeks. {BRAND.name} is closing on Hulu in this
              sample.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompetitorTrendChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Share of voice</CardTitle>
            <CardDescription>Demo share of brand mentions across tracked prompts</CardDescription>
          </CardHeader>
          <CardContent>
            <ShareOfVoiceChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Competitive landscape</CardTitle>
            <Badge tone="accent">Peacock demo</Badge>
          </div>
          <CardDescription>
            Ranked by demo share of voice · “You” = {BRAND.name} in this sample workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.map((comp, idx) => {
            const isYou = comp.id === "peacock";
            return (
              <div
                key={comp.id}
                className={cn(
                  "rounded-xl border p-4",
                  isYou
                    ? "border-accent/40 bg-accent-soft/40"
                    : "border-border bg-surface-raised",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-xs font-semibold text-muted-strong">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{comp.name}</p>
                        {isYou ? <Badge tone="accent">You · demo</Badge> : null}
                      </div>
                      <p className="text-[11px] text-muted">{comp.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/lookup?brand=${encodeURIComponent(comp.name)}&category=OTT%20streaming`}
                      className="text-xs font-medium text-accent-strong hover:underline"
                    >
                      Look up brand
                    </Link>
                    <span className="text-[11px] text-muted">Strongest on</span>
                    <EngineBadge engineId={comp.strongestEngine} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted">Share of voice</span>
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        {comp.shareOfVoice.toFixed(1)}%
                        <Delta value={comp.trend} />
                      </span>
                    </div>
                    <ProgressBar
                      value={(comp.shareOfVoice / 30) * 100}
                      className={isYou ? "" : "bg-border-strong"}
                      trackClassName="mt-1.5"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted">Mention rate</span>
                      <span className="font-semibold text-foreground">{comp.mentionRate}%</span>
                    </div>
                    <ProgressBar
                      value={comp.mentionRate}
                      className={isYou ? "" : "bg-border-strong"}
                      trackClassName="mt-1.5"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted">Avg. position</span>
                      <span className="font-semibold text-foreground">#{comp.avgPosition}</span>
                    </div>
                    <ProgressBar
                      value={Math.max(0, 100 - (comp.avgPosition - 1) * 22)}
                      className={isYou ? "" : "bg-border-strong"}
                      trackClassName="mt-1.5"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted">Sentiment</span>
                      <span className="font-semibold text-foreground">{comp.sentiment}/100</span>
                    </div>
                    <ProgressBar
                      value={comp.sentiment}
                      color={comp.sentiment >= 80 ? "var(--positive)" : undefined}
                      trackClassName="mt-1.5"
                    />
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted">{comp.note}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
