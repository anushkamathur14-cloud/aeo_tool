import type { Metadata } from "next";
import {
  BellRing,
  CalendarRange,
  Download,
  FileText,
  Files,
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
import { REPORTS, CITATION_SOURCES, type Report } from "@/lib/demo-data";
import { Delta } from "@/components/ui/delta";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports" };

const TYPE_META: Record<Report["type"], { icon: typeof FileText; tone: "accent" | "info" | "warning" | "default" }> = {
  "Weekly digest": { icon: CalendarRange, tone: "info" },
  "Monthly deep-dive": { icon: Files, tone: "accent" },
  "Competitor alert": { icon: BellRing, tone: "warning" },
  Custom: { icon: FileText, tone: "default" },
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generated digests, deep-dives, and alerts — ready to share with stakeholders."
        actions={<Button variant="primary">Generate report</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {REPORTS.map((report) => {
            const meta = TYPE_META[report.type];
            const Icon = meta.icon;
            return (
              <Card key={report.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-surface-hover sm:flex">
                    <Icon className="size-4.5 text-muted-strong" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {report.title}
                      </h3>
                      <Badge tone={meta.tone}>{report.type}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {report.period} · generated {formatDateTime(report.createdAt)}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {report.highlights.map((h, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs leading-relaxed text-muted-strong"
                        >
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    <Download className="size-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Citation sources sidebar */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Top citation sources</CardTitle>
            <CardDescription>
              Where answer engines learn about Peacock — from the last 30 days
              of scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {CITATION_SOURCES.map((src) => (
                <li
                  key={src.source}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-raised"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm text-foreground">
                        {src.source}
                      </p>
                      {src.owned && (
                        <Badge tone="accent" className="text-[10px]">
                          Owned
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted">
                      {src.citations} citations · {src.share}% share
                    </p>
                  </div>
                  <Delta value={src.trend} />
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg border border-border bg-surface-raised p-3 text-[11px] leading-relaxed text-muted">
              Owned sources account for 19.1% of citations, up 6.4 pp since the
              llms.txt rollout. Review platforms (G2, Capterra, TrustRadius)
              still drive 38% combined.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
