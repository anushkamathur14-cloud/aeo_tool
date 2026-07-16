"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Globe,
  Loader2,
  Wand2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { OPTIMIZER_SAMPLE } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type Phase = "idle" | "analyzing" | "done";

const CHECK_META = {
  pass: { icon: CheckCircle2, className: "text-positive", label: "Pass" },
  warn: { icon: AlertTriangle, className: "text-warning", label: "Needs work" },
  fail: { icon: XCircle, className: "text-negative", label: "Missing" },
} as const;

const ANALYZE_STEPS = [
  "Fetching page content…",
  "Checking crawler accessibility…",
  "Parsing structure and headings…",
  "Evaluating answer extractability…",
  "Scanning structured data…",
  "Scoring against tracked prompts…",
];

export function OptimizeClient() {
  const [url, setUrl] = useState("peacocktv.com/blog/originals-guide");
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (phase !== "analyzing") return;
    if (stepIdx >= ANALYZE_STEPS.length) {
      const t = setTimeout(() => setPhase("done"), 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), 550);
    return () => clearTimeout(t);
  }, [phase, stepIdx]);

  const analyze = () => {
    setStepIdx(0);
    setPhase("analyzing");
  };

  const result = OPTIMIZER_SAMPLE;
  const passCount = result.checks.filter((c) => c.status === "pass").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Optimizer"
        description="Audit any page against answer-engine best practices: extractability, structure, schema, freshness, and crawler access."
      />

      {/* URL input */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a page URL to audit…"
              className="h-10 w-full rounded-lg border border-border bg-surface-raised pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <Button
            variant="primary"
            onClick={analyze}
            disabled={phase === "analyzing" || !url.trim()}
          >
            {phase === "analyzing" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wand2 className="size-4" />
            )}
            {phase === "analyzing" ? "Analyzing…" : "Analyze page"}
          </Button>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-accent-soft">
                <Wand2 className="size-6 text-accent-strong" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                Ready to audit
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted">
                Enter a URL and run the analyzer. You&apos;ll get a
                citability score, a checklist of answer-engine signals, and
                concrete before/after rewrite suggestions.
              </p>
            </Card>
          </motion.div>
        )}

        {phase === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-6">
              <div className="mx-auto max-w-md space-y-3">
                {ANALYZE_STEPS.map((step, i) => (
                  <div
                    key={step}
                    className={cn(
                      "flex items-center gap-3 text-sm transition-opacity",
                      i > stepIdx ? "opacity-30" : "opacity-100"
                    )}
                  >
                    {i < stepIdx ? (
                      <CheckCircle2 className="size-4 shrink-0 text-positive" />
                    ) : i === stepIdx ? (
                      <Loader2 className="size-4 shrink-0 animate-spin text-accent-strong" />
                    ) : (
                      <span className="size-4 shrink-0 rounded-full border border-border-strong" />
                    )}
                    <span
                      className={
                        i <= stepIdx ? "text-foreground" : "text-muted"
                      }
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Score */}
            <Card>
              <CardContent className="flex flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-5">
                  <div className="relative flex size-24 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="var(--surface-hover)"
                        strokeWidth="9"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="var(--warning)"
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 42}
                        initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                        animate={{
                          strokeDashoffset:
                            2 * Math.PI * 42 * (1 - result.score / 100),
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="text-2xl font-bold text-foreground">
                      {result.score}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Citability score
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{result.url}</p>
                    <Badge tone="warning" className="mt-2">
                      Good, with fixable gaps
                    </Badge>
                  </div>
                </div>
                <div className="flex-1 sm:pl-6 sm:border-l sm:border-border">
                  <p className="text-xs text-muted">
                    {passCount} of {result.checks.length} checks passing. The
                    two failing checks — FAQ schema and standalone paragraphs —
                    are the highest-leverage fixes for getting this page quoted
                    directly in AI answers.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle>Signal checklist</CardTitle>
                  <CardDescription>
                    Answer-engine ranking signals detected on the page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.checks.map((check) => {
                    const meta = CHECK_META[check.status];
                    const Icon = meta.icon;
                    return (
                      <div
                        key={check.id}
                        className="rounded-lg border border-border bg-surface-raised p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn("size-4 shrink-0", meta.className)} />
                          <span className="flex-1 text-sm font-medium text-foreground">
                            {check.label}
                          </span>
                          <span className={cn("text-[11px] font-medium", meta.className)}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-1.5 pl-6 text-xs leading-relaxed text-muted">
                          {check.detail}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Rewrite suggestions</CardTitle>
                  <CardDescription>
                    Concrete before/after edits, ordered by impact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.suggestions.map((s) => (
                    <div
                      key={s.title}
                      className="rounded-lg border border-border bg-surface-raised p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {s.title}
                        </p>
                        <Badge tone={s.impact === "high" ? "accent" : "info"} className="capitalize">
                          {s.impact}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-2 text-xs leading-relaxed">
                        <div className="rounded-md border border-negative/20 bg-negative-soft/50 p-2.5 text-muted-strong">
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-negative">
                            Before
                          </span>
                          {s.before}
                        </div>
                        <div className="flex justify-center">
                          <ArrowRight className="size-3.5 rotate-90 text-muted" />
                        </div>
                        <div className="rounded-md border border-positive/20 bg-positive-soft/50 p-2.5 text-muted-strong">
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-positive">
                            After
                          </span>
                          {s.after}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Score bar summary */}
            <Card className="p-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">
                  Projected score after applying all suggestions
                </span>
                <span className="font-semibold text-positive">68 → 91</span>
              </div>
              <div className="relative mt-2">
                <ProgressBar value={68} color="var(--warning)" />
                <div
                  className="absolute top-0 h-1.5 rounded-full bg-positive/40"
                  style={{ left: "68%", width: "23%" }}
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
