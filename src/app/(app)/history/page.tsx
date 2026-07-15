import type { Metadata } from "next";
import { CalendarClock, Zap } from "lucide-react";
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
import { VisibilityTrendChart } from "@/components/charts/visibility-trend-chart";
import { SCAN_HISTORY } from "@/lib/demo-data";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Scan history"
        description="Every completed scan, with visibility movement over time. Weekly scheduled scans run Mondays at 9:00 UTC."
      />

      <Card>
        <CardHeader>
          <CardTitle>Visibility over time</CardTitle>
          <CardDescription>
            Composite score from each weekly scan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VisibilityTrendChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All scans</CardTitle>
          <CardDescription>{SCAN_HISTORY.length} scans recorded</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-muted">
                <th className="pb-2.5 pr-4">Scan</th>
                <th className="pb-2.5 pr-4">Engines</th>
                <th className="pb-2.5 pr-4 text-right">Prompts</th>
                <th className="pb-2.5 pr-4 text-right">Mention rate</th>
                <th className="pb-2.5 pr-4 text-right">Avg. position</th>
                <th className="pb-2.5 pr-4 text-right">Visibility</th>
                <th className="pb-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SCAN_HISTORY.map((scan) => (
                <tr key={scan.id} className="hover:bg-surface-raised">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {scan.triggeredBy === "schedule" ? (
                        <CalendarClock className="size-3.5 shrink-0 text-muted" />
                      ) : (
                        <Zap className="size-3.5 shrink-0 text-warning" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {formatDateTime(scan.date)}
                        </p>
                        <p className="text-[11px] text-muted">
                          {scan.triggeredBy === "schedule"
                            ? "Scheduled"
                            : "Manual"}{" "}
                          · {scan.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {scan.engines.map((e) => (
                        <EngineBadge key={e} engineId={e} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-muted-strong">
                    {scan.promptCount}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-muted-strong">
                    {scan.mentionRate}%
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-muted-strong">
                    #{scan.avgPosition}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="inline-flex items-center gap-2">
                      <span className="font-semibold tabular-nums text-foreground">
                        {scan.visibilityScore}
                      </span>
                      <Delta value={scan.delta} />
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Badge tone={scan.status === "complete" ? "positive" : "warning"}>
                      {scan.status === "complete" ? "Complete" : "Partial"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
