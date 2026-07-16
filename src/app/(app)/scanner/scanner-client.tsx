"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Eye,
  ListOrdered,
  Loader2,
  MessageSquareText,
  Radar,
  RotateCcw,
  Sparkles,
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
import { BRAND, COMPETITORS, ENGINES, PROMPTS, type EngineId } from "@/lib/demo-data";
import { ENGINE_TO_PROVIDER, readProviderKeys } from "@/lib/keys";
import { cn } from "@/lib/utils";

type Phase = "idle" | "running" | "done";

interface EngineProgress {
  engineId: EngineId;
  status: "queued" | "scanning" | "done";
  promptsDone: number;
}

interface ScanResult {
  mode: "demo" | "hybrid";
  visibilityScore: number;
  delta: number;
  mentionRate: number;
  avgPosition: number;
  highlights: { tone: "positive" | "warning" | "info"; text: string }[];
}

const DEMO_RESULT: ScanResult = {
  mode: "demo",
  visibilityScore: 53,
  delta: 1,
  mentionRate: 50,
  avgPosition: 2.7,
  highlights: [
    {
      tone: "positive",
      text: "Streamora entered Gemini's answer for “Best streaming platforms with original series in 2026” at position #3 — first Gemini gain in 4 weeks.",
    },
    {
      tone: "positive",
      text: "Perplexity now cites streamora.com/blog on 5 of 12 prompts (up from 4).",
    },
    {
      tone: "warning",
      text: "Copilot dropped Streamora from “Best streaming service for kids profiles” — Disney+ took the slot.",
    },
    {
      tone: "info",
      text: "New citation source detected: variety.com now appears on 2 prompts.",
    },
  ],
};

const SCAN_TICK_MS = 280;
const LIVE_PROMPT_CAP = 6;

export function ScannerClient() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedEngines, setSelectedEngines] = useState<Set<EngineId>>(
    () => new Set(ENGINES.map((engine) => engine.id)),
  );
  const [progress, setProgress] = useState<EngineProgress[]>([]);
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [result, setResult] = useState<ScanResult>(DEMO_RESULT);
  const [error, setError] = useState<string | null>(null);
  const [configuredProviders, setConfiguredProviders] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setConfiguredProviders(Object.keys(readProviderKeys()).length);
  }, []);

  const liveEligible = useMemo(
    () =>
      ENGINES.filter((engine) => {
        if (!selectedEngines.has(engine.id)) return false;
        const provider = ENGINE_TO_PROVIDER[engine.id];
        if (!provider || provider === "mock") return false;
        return Boolean(readProviderKeys()[provider]);
      }).length,
    [selectedEngines, configuredProviders],
  );

  const promptBudget = liveEligible > 0 ? LIVE_PROMPT_CAP : PROMPTS.length;
  const totalPrompts = promptBudget;

  const toggleEngine = (id: EngineId) => {
    setSelectedEngines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const runLiveScan = useCallback(async () => {
    const keys = readProviderKeys();
    const providers = Array.from(selectedEngines)
      .map((engineId) => ENGINE_TO_PROVIDER[engineId])
      .filter((provider): provider is NonNullable<typeof provider> => Boolean(provider))
      .map((provider) => (provider !== "mock" && keys[provider] ? provider : "mock"));

    const uniqueProviders = Array.from(new Set(providers)).slice(0, 5);
    const response = await fetch("/api/v1/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: BRAND.name,
        website: `https://${BRAND.domain}`,
        industry: BRAND.category,
        country: "United States",
        competitors: COMPETITORS.slice(0, 3).map((competitor) => competitor.name),
        products: ["Streamora Standard", "Streamora Premium"],
        audience: "cord-cutters and streaming households in the United States",
        providers: uniqueProviders,
        keys,
        promptLimit: LIVE_PROMPT_CAP,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Live scan failed");
    }

    const payload = (await response.json()) as {
      mode: "demo" | "hybrid";
      results: Array<{
        requestedProvider: string;
        mentions: Array<{ company: string; order: number }>;
        recommendationStrength: number;
        text: string;
      }>;
    };

    const mentioned = payload.results.filter((row) =>
      row.mentions.some((mention) => mention.company.toLowerCase() === BRAND.name.toLowerCase()),
    );
    const mentionRate = Math.round((mentioned.length / Math.max(payload.results.length, 1)) * 100);
    const avgPosition =
      Math.round(
        (mentioned.reduce((sum, row) => {
          const mention = row.mentions.find(
            (item) => item.company.toLowerCase() === BRAND.name.toLowerCase(),
          );
          return sum + (mention?.order ?? 5);
        }, 0) /
          Math.max(mentioned.length, 1)) *
          10,
      ) / 10;
    const visibilityScore = Math.min(
      100,
      Math.round(mentionRate * 0.55 + (100 - (avgPosition - 1) * 18) * 0.45),
    );

    setResult({
      mode: payload.mode,
      visibilityScore,
      delta: visibilityScore - 52,
      mentionRate,
      avgPosition: Number.isFinite(avgPosition) ? avgPosition : 3.2,
      highlights: [
        {
          tone: "info",
          text:
            payload.mode === "hybrid"
              ? `Hybrid scan used your configured keys for live engines and demo responses for the rest (${payload.results.length} answers).`
              : "No live keys were available, so BrandSignal used the demo provider adapters.",
        },
        {
          tone: mentionRate >= 50 ? "positive" : "warning",
          text: `${BRAND.name} was mentioned in ${mentionRate}% of generated answers.`,
        },
        {
          tone: "positive",
          text: "Open Prompt Explorer and Opportunities to turn these findings into content and authority actions.",
        },
      ],
    });
  }, [selectedEngines]);

  const startScan = useCallback(() => {
    const keys = readProviderKeys();
    setConfiguredProviders(Object.keys(keys).length);
    setError(null);
    setResult(DEMO_RESULT);
    const engines = ENGINES.filter((engine) => selectedEngines.has(engine.id));
    setProgress(
      engines.map((engine, index) => ({
        engineId: engine.id,
        status: index === 0 ? "scanning" : "queued",
        promptsDone: 0,
      })),
    );
    setCurrentPromptIdx(0);
    setPhase("running");

    if (Object.keys(keys).length > 0) {
      void runLiveScan().catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Live scan failed");
        setResult(DEMO_RESULT);
      });
    }
  }, [runLiveScan, selectedEngines]);

  useEffect(() => {
    if (phase !== "running") return;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev.map((item) => ({ ...item }));
        const active = next.find((item) => item.status === "scanning");
        if (!active) {
          const queued = next.find((item) => item.status === "queued");
          if (queued) queued.status = "scanning";
          return next;
        }
        active.promptsDone += 1;
        setCurrentPromptIdx(active.promptsDone % PROMPTS.length);
        if (active.promptsDone >= totalPrompts) {
          active.status = "done";
          const queued = next.find((item) => item.status === "queued");
          if (queued) queued.status = "scanning";
        }
        return next;
      });
    }, SCAN_TICK_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, totalPrompts]);

  useEffect(() => {
    if (phase === "running" && progress.length > 0 && progress.every((item) => item.status === "done")) {
      const timeout = setTimeout(() => setPhase("done"), 500);
      return () => clearTimeout(timeout);
    }
  }, [phase, progress]);

  const overallPct =
    progress.length === 0
      ? 0
      : Math.round(
          (progress.reduce((acc, item) => acc + item.promptsDone, 0) /
            (progress.length * totalPrompts)) *
            100,
        );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scanner"
        description="Ask customer-journey prompts across answer engines and capture how Streamora shows up."
        actions={
          phase === "done" ? (
            <Button
              variant="secondary"
              onClick={() => {
                setPhase("idle");
                setProgress([]);
                setError(null);
              }}
            >
              <RotateCcw className="size-3.5" />
              New scan
            </Button>
          ) : undefined
        }
      />

      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>Configure scan</CardTitle>
                <CardDescription>
                  {liveEligible > 0
                    ? `Live/hybrid mode ready — ${liveEligible} engine(s) have keys. Demo-safe cap: ${LIVE_PROMPT_CAP} prompts.`
                    : `${PROMPTS.length} tracked prompts will run in polished demo mode. Add keys in Settings for live engines.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-medium text-muted">Answer engines</p>
                  <div className="flex flex-wrap gap-2">
                    {ENGINES.map((engine) => {
                      const selected = selectedEngines.has(engine.id);
                      const provider = ENGINE_TO_PROVIDER[engine.id];
                      const live =
                        provider &&
                        provider !== "mock" &&
                        Boolean(readProviderKeys()[provider]);
                      return (
                        <button
                          key={engine.id}
                          onClick={() => toggleEngine(engine.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors cursor-pointer",
                            selected
                              ? "border-accent/50 bg-accent-soft text-foreground"
                              : "border-border bg-surface-raised text-muted hover:border-border-strong",
                          )}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{ background: engine.color }}
                          />
                          {engine.name}
                          {live ? (
                            <Badge tone="positive">Live</Badge>
                          ) : (
                            <Badge>Demo</Badge>
                          )}
                          {selected ? (
                            <CheckCircle2 className="size-3.5 text-accent-strong" />
                          ) : (
                            <Circle className="size-3.5 text-border-strong" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface-raised p-4">
                  <p className="text-xs font-medium text-muted">Scan scope</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-strong">
                    <span>
                      <span className="font-semibold text-foreground">{totalPrompts}</span> prompts
                    </span>
                    <span>
                      <span className="font-semibold text-foreground">{selectedEngines.size}</span>{" "}
                      engines
                    </span>
                    <span>
                      <span className="font-semibold text-foreground">
                        {totalPrompts * selectedEngines.size}
                      </span>{" "}
                      answers to analyze
                    </span>
                  </div>
                </div>

                <Button variant="primary" onClick={startScan}>
                  <Radar className="size-4" />
                  Start scan
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === "running" && (
          <motion.div
            key="running"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-accent-strong" />
                    Scanning answer engines
                  </CardTitle>
                  <CardDescription>
                    Asking prompts and parsing answers for brand mentions
                  </CardDescription>
                </div>
                <span className="text-2xl font-semibold tabular-nums text-foreground">
                  {overallPct}%
                </span>
              </CardHeader>
              <CardContent className="space-y-5">
                <ProgressBar value={overallPct} />
                <div className="space-y-3">
                  {progress.map((item) => {
                    const engine = ENGINES.find((entry) => entry.id === item.engineId)!;
                    const pct = Math.round((item.promptsDone / totalPrompts) * 100);
                    return (
                      <div
                        key={item.engineId}
                        className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3"
                      >
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: engine.color }}
                        />
                        <span className="w-24 shrink-0 text-sm font-medium text-foreground">
                          {engine.name}
                        </span>
                        <ProgressBar value={pct} color={engine.color} trackClassName="flex-1" />
                        <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted">
                          {item.status === "queued"
                            ? "Queued"
                            : item.status === "done"
                              ? "Complete"
                              : `${item.promptsDone}/${totalPrompts} prompts`}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-lg border border-border bg-surface-raised px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
                    Currently asking
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-strong">
                    &ldquo;{PROMPTS[currentPromptIdx % PROMPTS.length].text}&rdquo;
                  </p>
                </div>
              </CardContent>
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
            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-positive/10 blur-3xl" />
              <CardHeader className="flex-row items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-positive-soft">
                  <CheckCircle2 className="size-5 text-positive" />
                </div>
                <div>
                  <CardTitle>Scan complete</CardTitle>
                  <CardDescription>
                    {totalPrompts} prompts × {progress.length} engines —{" "}
                    {result.mode === "hybrid" ? "hybrid live + demo answers" : "demo answers"} analyzed
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
                    Live scan fallback: {error}
                  </div>
                ) : null}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-surface-raised p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Eye className="size-3.5" /> Visibility score
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-foreground">
                        {result.visibilityScore}
                      </span>
                      <span className="text-xs font-medium text-positive">
                        {result.delta >= 0 ? "+" : ""}
                        {result.delta} vs baseline
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-raised p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <MessageSquareText className="size-3.5" /> Mention rate
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-foreground">
                      {result.mentionRate}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-raised p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <ListOrdered className="size-3.5" /> Avg. position
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-foreground">
                      #{result.avgPosition}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">
                    <Sparkles className="size-3.5 text-accent-strong" />
                    What changed
                  </p>
                  <ul className="space-y-2">
                    {result.highlights.map((highlight, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + index * 0.1 }}
                        className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-raised px-4 py-3"
                      >
                        <Badge
                          tone={
                            highlight.tone === "positive"
                              ? "positive"
                              : highlight.tone === "warning"
                                ? "warning"
                                : "info"
                          }
                          className="mt-0.5 shrink-0"
                        >
                          {highlight.tone === "positive"
                            ? "Gain"
                            : highlight.tone === "warning"
                              ? "Loss"
                              : "New"}
                        </Badge>
                        <p className="text-sm leading-relaxed text-muted-strong">{highlight.text}</p>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/prompts">
                    <Button variant="primary">
                      Review prompt results <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                  <Link href="/history">
                    <Button variant="secondary">View scan history</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
