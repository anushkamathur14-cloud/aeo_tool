import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Delta } from "@/components/ui/delta";
import { PageHeader } from "@/components/ui/page-header";
import { EngineBadge } from "@/components/ui/engine-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CompetitorTrendChart } from "@/components/charts/visibility-trend-chart";
import { ShareOfVoiceChart } from "@/components/charts/share-of-voice-chart";
import { COMPETITORS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Competitors" };

export default function CompetitorsPage() {
  const sorted = [...COMPETITORS].sort((a, b) => b.shareOfVoice - a.shareOfVoice);
  const streamoraRank = sorted.findIndex((c) => c.id === "streamora") + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitors"
        description={`How Streamora stacks up against 5 tracked competitors across the same prompts and engines. Current share-of-voice rank: #${streamoraRank} of ${sorted.length}.`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Visibility trend vs competitors</CardTitle>
            <CardDescription>
              Weekly visibility score, 12 weeks. Streamora is closing on
              Hulu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompetitorTrendChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Share of voice</CardTitle>
            <CardDescription>
              Share of all brand mentions across tracked prompts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShareOfVoiceChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitive landscape</CardTitle>
          <CardDescription>
            Ranked by share of voice · sentiment measures how favorably
            engines describe each brand
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.map((comp, idx) => {
            const isYou = comp.id === "streamora";
            return (
              <div
                key={comp.id}
                className={cn(
                  "rounded-xl border p-4",
                  isYou
                    ? "border-accent/40 bg-accent-soft/40"
                    : "border-border bg-surface-raised"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-xs font-semibold text-muted-strong">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {comp.name}
                        </p>
                        {isYou && <Badge tone="accent">You</Badge>}
                      </div>
                      <p className="text-[11px] text-muted">{comp.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/lookup?brand=${encodeURIComponent(comp.name)}`}
                      className="text-xs font-medium text-accent-strong hover:underline"
                    >
                      View mentions
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
                      <span className="font-semibold text-foreground">
                        {comp.mentionRate}%
                      </span>
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
                      <span className="font-semibold text-foreground">
                        #{comp.avgPosition}
                      </span>
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
                      <span className="font-semibold text-foreground">
                        {comp.sentiment}/100
                      </span>
                    </div>
                    <ProgressBar
                      value={comp.sentiment}
                      color={comp.sentiment >= 80 ? "var(--positive)" : undefined}
                      trackClassName="mt-1.5"
                    />
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted">
                  {comp.note}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
