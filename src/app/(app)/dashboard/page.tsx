import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Eye,
  FileText,
  Lightbulb,
  ListOrdered,
  MessageSquareText,
  PieChart,
  Radar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { VisibilityTrendChart } from "@/components/charts/visibility-trend-chart";
import { EngineBarChart } from "@/components/charts/engine-bar-chart";
import { SentimentDonut } from "@/components/charts/share-of-voice-chart";
import {
  DASHBOARD_STATS,
  ENGINES,
  OPPORTUNITIES,
  RECENT_ACTIVITY,
  type ActivityItem,
} from "@/lib/demo-data";
import { Delta } from "@/components/ui/delta";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const ACTIVITY_ICONS: Record<ActivityItem["type"], typeof Radar> = {
  scan: Radar,
  alert: Bell,
  opportunity: Lightbulb,
  report: FileText,
  change: Activity,
};

export default function DashboardPage() {
  const stats = DASHBOARD_STATS;
  const topOpportunities = OPPORTUNITIES.filter(
    (o) => o.impact === "high" && o.status !== "done"
  ).slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="How AI answer engines see NovaCRM this week, across ChatGPT, Claude, Perplexity, Gemini, and Copilot."
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visibility score"
          value={String(stats.visibilityScore)}
          delta={stats.visibilityDelta}
          icon={Eye}
          hint="Composite of mention rate and answer position"
        />
        <StatCard
          label="Mention rate"
          value={`${stats.mentionRate}%`}
          delta={stats.mentionRateDelta}
          deltaSuffix=" pp"
          icon={MessageSquareText}
          hint={`Across ${stats.trackedPrompts} tracked prompts`}
        />
        <StatCard
          label="Avg. position"
          value={`#${stats.avgPosition}`}
          delta={stats.avgPositionDelta}
          deltaInvert
          icon={ListOrdered}
          hint="Rank among brands when mentioned"
        />
        <StatCard
          label="Share of voice"
          value={`${stats.shareOfVoice}%`}
          delta={stats.shareOfVoiceDelta}
          deltaSuffix=" pp"
          icon={PieChart}
          hint="vs 5 tracked competitors"
        />
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Visibility trend</CardTitle>
              <CardDescription>
                Weekly composite score over the last 12 weeks
              </CardDescription>
            </div>
            <Badge tone="positive">+21 pts this quarter</Badge>
          </CardHeader>
          <CardContent>
            <VisibilityTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Answer sentiment</CardTitle>
            <CardDescription>
              Tone of AI answers that mention NovaCRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SentimentDonut />
            <div className="mt-4 rounded-lg border border-border bg-surface-raised p-3">
              <p className="text-xs text-muted-strong">
                One negative-sentiment cluster: Gemini surfaces outdated 2024
                pricing on pricing prompts.
              </p>
              <Link
                href="/opportunities"
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-accent-strong hover:underline"
              >
                View fix <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Engine breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mention rate by engine</CardTitle>
            <CardDescription>
              Share of tracked prompts where NovaCRM appears in the answer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EngineBarChart />
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {ENGINES.map((engine) => (
                <div
                  key={engine.id}
                  className="rounded-lg border border-border bg-surface-raised px-3 py-2"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: engine.color }}
                    />
                    <span className="text-[11px] font-medium text-muted-strong">
                      {engine.name}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {engine.mentionRate}%
                    </span>
                    <Delta value={engine.trend} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top AEO opportunities */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Top AEO opportunities</CardTitle>
              <CardDescription>Highest-impact ways to improve AI visibility</CardDescription>
            </div>
            <Link
              href="/opportunities"
              className="text-xs font-medium text-accent-strong hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {topOpportunities.map((opp) => (
              <Link
                key={opp.id}
                href="/opportunities"
                className="block rounded-lg border border-border bg-surface-raised p-3 transition-colors hover:border-border-strong hover:bg-surface-hover"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium leading-snug text-foreground">
                    {opp.title}
                  </p>
                  <Badge tone="accent">High</Badge>
                </div>
                <p className="mt-1.5 text-[11px] text-muted">
                  {opp.estimatedLift}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Scans, ranking changes, and alerts from the last few days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {RECENT_ACTIVITY.map((item) => {
              const Icon = ACTIVITY_ICONS[item.type];
              return (
                <li key={item.id} className="flex items-start gap-3 py-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
                    <Icon className="size-3.5 text-muted-strong" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted">{item.detail}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted">
                    {formatDateTime(item.time)}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
