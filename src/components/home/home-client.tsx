"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Eye,
  Link2,
  ListOrdered,
  Quote,
  Radar,
  Search,
  Sparkles,
  Swords,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Delta } from "@/components/ui/delta";
import { ProgressBar } from "@/components/ui/progress-bar";

function AnimatedValue({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const frames = 28;
    const tick = () => {
      frame += 1;
      const next = Math.round((value * frame) / frames);
      setDisplay(next);
      if (frame < frames) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <span className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

const INTEL_METRICS = [
  { label: "Brand Visibility", value: "52", hint: "composite AI visibility score", icon: Eye },
  { label: "AI Mentions", value: "49%", hint: "prompts where Peacock appears", icon: Quote },
  { label: "Recommendation Rate", value: "38%", hint: "answers that actively recommend", icon: Sparkles },
  { label: "Citation Coverage", value: "31%", hint: "answers citing owned sources", icon: Link2 },
  { label: "Competitor Share", value: "18%", hint: "share of voice vs Netflix & peers", icon: Swords },
  { label: "Brand Authority", value: "64", hint: "entity + third-party trust signal", icon: TrendingUp },
];

const ACTIONS = [
  { action: "Add Peacock vs Netflix comparison page", impact: "High", effort: "Low" },
  { action: "Expand FAQ for cord-cutting & plan tiers", impact: "Medium", effort: "Low" },
  { action: "Add Product + Offer schema on pricing", impact: "Medium", effort: "Low" },
  { action: "Earn third-party citations (TechRadar, Variety)", impact: "High", effort: "High" },
];

const DESTINATIONS = [
  {
    href: "/lookup",
    title: "Brand lookup",
    description: "See if AI recommends your brand live.",
    icon: Search,
  },
  {
    href: "/competitors",
    title: "Brand vs competitor",
    description: "Mention frequency, order, and prompt wins.",
    icon: Swords,
  },
  {
    href: "/opportunities",
    title: "Prioritized actions",
    description: "High-impact fixes ranked by effort.",
    icon: ListOrdered,
  },
  {
    href: "/dashboard",
    title: "Visibility dashboard",
    description: "Executive Brand Pulse across engines.",
    icon: Radar,
  },
  {
    href: "/guide",
    title: "How it works",
    description: "From mention gaps to recommended actions.",
    icon: BookOpen,
  },
];

export function HomeClient() {
  return (
    <div className="space-y-14 pb-8">
      {/* 1. Outcome-focused hero + Brand Pulse */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-surface via-surface to-surface-raised px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -top-28 -right-20 size-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-info/5 blur-3xl" />

        <div className="relative grid grid-cols-1 items-start gap-10 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <p className="text-sm font-semibold tracking-[0.18em] text-accent-strong uppercase">
              BrandSignal
            </p>
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Is AI recommending your brand—or your competitors?
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-strong">
              Monitor your visibility across ChatGPT, Grok, Gemini, Claude, and Perplexity.
              Discover where your brand appears, why it wins, and what to improve.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/lookup">
                <Button variant="primary">
                  Look up your brand <ArrowRight className="size-3.5" />
                </Button>
              </Link>
              <Link href="/competitors">
                <Button variant="secondary">Compare vs competitors</Button>
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-2xl border border-border/50 bg-surface/80 p-5 backdrop-blur-sm sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted uppercase">Brand Pulse</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Peacock · this week</p>
              </div>
              <Badge tone="accent">Live demo</Badge>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-surface-raised/80 px-3 py-3">
                <p className="text-[11px] text-muted">Visibility</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  <AnimatedValue value={74} suffix="%" />
                </p>
              </div>
              <div className="rounded-xl bg-surface-raised/80 px-3 py-3">
                <p className="text-[11px] text-muted">Mentions</p>
                <p className="mt-1 flex items-baseline gap-1.5 text-2xl font-semibold text-foreground">
                  <Delta value={12} suffix="%" />
                </p>
              </div>
              <div className="rounded-xl bg-surface-raised/80 px-3 py-3">
                <p className="text-[11px] text-muted">Competitor share</p>
                <p className="mt-1 flex items-baseline gap-1.5 text-2xl font-semibold text-foreground">
                  <Delta value={-5} suffix="%" invert />
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-positive/20 bg-positive-soft/40 px-3 py-3">
                <p className="text-[11px] text-positive">Top opportunity</p>
                <p className="mt-1 text-sm font-medium text-foreground">Comparison pages</p>
              </div>
              <div className="rounded-xl border border-warning/20 bg-warning-soft/40 px-3 py-3">
                <p className="text-[11px] text-warning">Biggest risk</p>
                <p className="mt-1 text-sm font-medium text-foreground">Low citation coverage</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Results that feel alive */}
      <section className="space-y-4">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            See exactly where you disappear
          </h2>
          <p className="mt-2 text-sm text-muted-strong">
            Not abstract scores — real prompts, engine answers, and why your brand was skipped.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-surface px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info">Prompt</Badge>
            <p className="text-sm font-medium text-foreground sm:text-base">
              Best OTT streaming service for cord-cutters in 2026
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#34d399]" />
                <p className="text-sm font-semibold text-foreground">ChatGPT</p>
              </div>
              <ol className="space-y-2">
                {["Netflix", "Amazon Prime Video", "Hulu", "Disney+"].map((name, index) => (
                  <li
                    key={name}
                    className="flex items-center justify-between rounded-xl bg-surface-raised/70 px-3 py-2.5 text-sm"
                  >
                    <span className="text-muted-strong">
                      <span className="mr-2 tabular-nums text-muted">#{index + 1}</span>
                      {name}
                    </span>
                    <Badge tone="positive">Recommended</Badge>
                  </li>
                ))}
              </ol>
              <div className="flex items-start gap-2 rounded-xl border border-negative/25 bg-negative-soft/35 px-3 py-3">
                <XCircle className="mt-0.5 size-4 shrink-0 text-negative" />
                <div>
                  <p className="text-sm font-medium text-foreground">Peacock not mentioned</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-strong">
                    Weak comparison content · Few third-party citations · Thin entity association
                    with “cord-cutting”
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-surface-raised/50 p-4 sm:p-5">
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                Why did AI choose them?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-strong">
                AI associated <span className="font-medium text-foreground">Netflix</span> with
                “best OTT for cord-cutters” because:
              </p>
              <ul className="mt-4 space-y-2.5">
                {[
                  "18 comparison articles ranking Netflix first",
                  "240+ referring domains on review roundups",
                  "5 authoritative review sites citing catalog depth",
                  "Strong product schema on pricing & plans",
                  "Frequently cited originals / discovery pages",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent-strong" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-t border-border/60 pt-4">
                <p className="text-xs font-medium text-muted">Suggested actions for Peacock</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Create 3 comparison pages", "Add FAQ schema", "Publish pricing comparison", "Strengthen entity links"].map(
                    (action) => (
                      <Badge key={action} tone="accent">
                        {action}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Brand intelligence metrics */}
      <section className="space-y-4">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Brand intelligence, not SEO jargon
          </h2>
          <p className="mt-2 text-sm text-muted-strong">
            Track the signals marketing teams actually act on — mentions, recommendations, citations,
            and share versus peers.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {INTEL_METRICS.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-border/40 bg-surface px-5 py-5"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-muted">{metric.label}</p>
                <div className="flex size-8 items-center justify-center rounded-lg bg-accent-soft">
                  <metric.icon className="size-4 text-accent-strong" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {metric.value}
              </p>
              <p className="mt-1 text-[11px] text-muted">{metric.hint}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Prioritized actions */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Prioritized actions
            </h2>
            <p className="mt-2 text-sm text-muted-strong">
              High-impact moves first — so teams know what to ship this week.
            </p>
          </div>
          <Link href="/opportunities">
            <Button variant="ghost">
              Open full backlog <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface">
          <div className="grid grid-cols-[1.6fr_0.5fr_0.5fr] gap-3 border-b border-border/50 px-5 py-3 text-[11px] font-medium tracking-wide text-muted uppercase">
            <span>Action</span>
            <span>Impact</span>
            <span>Effort</span>
          </div>
          {ACTIONS.map((row) => (
            <div
              key={row.action}
              className="grid grid-cols-[1.6fr_0.5fr_0.5fr] items-center gap-3 border-b border-border/40 px-5 py-3.5 last:border-b-0"
            >
              <p className="text-sm text-foreground">{row.action}</p>
              <Badge tone={row.impact === "High" ? "positive" : "info"}>{row.impact}</Badge>
              <Badge tone={row.effort === "High" ? "warning" : "default"}>{row.effort}</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Brand vs Competitor */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-border/50 bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Swords className="size-4 text-accent-strong" />
            <h2 className="text-lg font-semibold text-foreground">Brand vs competitor</h2>
          </div>
          <p className="mt-2 text-sm text-muted-strong">
            Demo view for Peacock vs peers — who gets mentioned, who gets recommended first, and
            which engines favor whom. Look up your own brand separately in Brand lookup.
          </p>

          <div className="mt-5 space-y-4">
            {[
              { name: "Netflix", mention: 91, position: "#1.3", color: "#e50914" },
              { name: "Peacock", mention: 49, position: "#2.8", color: "#2dd4bf" },
              { name: "Hulu", mention: 74, position: "#2.6", color: "#1ce783" },
            ].map((row) => (
              <div key={row.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{row.name}</span>
                  <span className="tabular-nums text-muted">
                    {row.mention}% mentions · avg {row.position}
                  </span>
                </div>
                <ProgressBar value={row.mention} color={row.color} />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-strong">
            <Badge>Mention frequency</Badge>
            <Badge>Recommendation order</Badge>
            <Badge>Citation overlap</Badge>
            <Badge>Prompt wins</Badge>
            <Badge>Engine differences</Badge>
          </div>

          <Link href="/competitors" className="mt-5 inline-flex">
            <Button variant="secondary">
              Open competitor mode <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-border/50 bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <CircleAlert className="size-4 text-warning" />
            <h2 className="text-lg font-semibold text-foreground">Decision support, not just reports</h2>
          </div>
          <p className="mt-2 text-sm text-muted-strong">
            BrandSignal doesn’t stop at “competitor score is higher.” It explains the evidence
            engines used — then turns gaps into a shippable backlog.
          </p>
          <div className="mt-5 space-y-3">
            {[
              {
                title: "Measure",
                body: "Mentions, recommendation rate, citation coverage across engines.",
              },
              {
                title: "Explain",
                body: "Why Netflix won the prompt — articles, domains, schema, review sites.",
              },
              {
                title: "Act",
                body: "Prioritized comparison pages, FAQs, schema, and citation plays.",
              },
            ].map((step) => (
              <div key={step.title} className="rounded-xl bg-surface-raised/70 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-1 text-sm text-muted-strong">{step.body}</p>
              </div>
            ))}
          </div>
          <Link href="/guide" className="mt-5 inline-flex">
            <Button variant="ghost">
              See how it works <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. Destinations — lighter */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Explore the workspace</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {DESTINATIONS.map((item) => (
            <Link key={item.href} href={item.href} className="group block">
              <div className="h-full rounded-2xl border border-border/40 bg-surface px-4 py-4 transition-colors group-hover:border-accent/35 group-hover:bg-surface-raised/80">
                <item.icon className="size-4 text-accent-strong" />
                <p className="mt-3 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
