import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Delta } from "@/components/ui/delta";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  ENGINE_LOOKUP,
  PROMPTS,
  getPromptById,
} from "@/lib/demo-data";
import { formatDateTime } from "@/lib/utils";

export function generateStaticParams() {
  return PROMPTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const prompt = getPromptById(id);
  return { title: prompt ? `Prompt · ${prompt.text.slice(0, 40)}` : "Prompt" };
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prompt = getPromptById(id);
  if (!prompt) notFound();

  const mentionedCount = prompt.results.filter((r) => r.mentioned).length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/prompts"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All prompts
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          &ldquo;{prompt.text}&rdquo;
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge>{prompt.category}</Badge>
          <Badge tone="info" className="capitalize">{prompt.intent}</Badge>
          <SentimentBadge sentiment={prompt.sentiment} />
          <span className="text-xs text-muted">
            Last scanned {formatDateTime(prompt.lastScanned)}
          </span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted">Engines mentioning Streamora</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {mentionedCount}
            <span className="text-sm font-normal text-muted"> / 5</span>
          </p>
          <ProgressBar value={(mentionedCount / 5) * 100} className="mt-2" trackClassName="mt-2" />
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Avg. position</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {prompt.avgPosition ? `#${prompt.avgPosition}` : "—"}
          </p>
          <p className="mt-1 text-[11px] text-muted">when mentioned</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Ask-volume score</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {prompt.volumeScore}
            <span className="text-sm font-normal text-muted"> / 100</span>
          </p>
          <p className="mt-1 text-[11px] text-muted">estimated frequency</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Trend (4 weeks)</p>
          <div className="mt-1">
            <Delta value={prompt.trend} suffix=" pp" className="text-xl" />
          </div>
          <p className="mt-1 text-[11px] text-muted">mention rate change</p>
        </Card>
      </div>

      {/* Per-engine results */}
      <Card>
        <CardHeader>
          <CardTitle>Answers by engine</CardTitle>
          <CardDescription>
            What each answer engine said in the latest scan, with the sources
            it cited
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {prompt.results.map((result) => {
            const engine = ENGINE_LOOKUP[result.engineId];
            return (
              <div
                key={result.engineId}
                className="rounded-xl border border-border bg-surface-raised p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: engine.color }}
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {engine.name}
                    </span>
                    <span className="text-[11px] text-muted">
                      {engine.vendor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.mentioned ? (
                      <>
                        <Badge tone="positive">
                          <CheckCircle2 className="size-3" /> Mentioned · #
                          {result.position}
                        </Badge>
                        <SentimentBadge sentiment={result.sentiment} />
                      </>
                    ) : (
                      <Badge tone="negative">
                        <XCircle className="size-3" /> Not mentioned
                      </Badge>
                    )}
                  </div>
                </div>

                <blockquote className="mt-3 border-l-2 border-border-strong pl-3 text-sm leading-relaxed text-muted-strong">
                  {result.snippet}
                </blockquote>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-muted">Cited sources:</span>
                  {result.citedSources.map((source) => (
                    <span
                      key={source}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-strong"
                    >
                      <ExternalLink className="size-2.5" />
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
