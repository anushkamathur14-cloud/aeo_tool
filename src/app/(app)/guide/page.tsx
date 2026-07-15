import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Lightbulb,
  MessageSquareText,
  Network,
  Radar,
  Swords,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "How it works" };

const STEPS = [
  {
    icon: MessageSquareText,
    title: "1. Define the prompts that matter",
    body: "Start with the questions your buyers actually ask AI assistants — \u201cbest CRM for mid-market\u201d, \u201cNovaCRM vs HubSpot\u201d, \u201cSalesforce alternatives\u201d. BrandSignal tracks each prompt as a keyword-equivalent for the AI era.",
    href: "/prompts",
    linkLabel: "Browse tracked prompts",
  },
  {
    icon: Radar,
    title: "2. Scan the answer engines",
    body: "On a weekly schedule (or on demand), BrandSignal asks every tracked prompt across ChatGPT, Claude, Perplexity, Gemini, and Copilot, then parses each answer: was your brand mentioned, at what position, with what sentiment, and citing which sources.",
    href: "/scanner",
    linkLabel: "Run a scan",
  },
  {
    icon: TrendingUp,
    title: "3. Measure visibility over time",
    body: "Every scan rolls up into a visibility score — a composite of mention rate and average position. History lets you connect content changes to movement in how engines answer.",
    href: "/history",
    linkLabel: "See scan history",
  },
  {
    icon: Swords,
    title: "4. Benchmark against competitors",
    body: "The same scans capture every competitor mentioned in every answer, giving you share of voice, head-to-head mention rates, and which engines favor whom.",
    href: "/competitors",
    linkLabel: "View competitor landscape",
  },
  {
    icon: Network,
    title: "5. Understand your entity graph",
    body: "Answer engines reason about entities, not keywords. BrandSignal maps which features, categories, audiences, and sources engines associate with your brand — and where the associations are weak.",
    href: "/entities",
    linkLabel: "Explore the entity graph",
  },
  {
    icon: Lightbulb,
    title: "6. Act on ranked opportunities",
    body: "Findings become a prioritized backlog: citation gaps to close, stale data to fix, content to publish, positioning to reinforce — each with estimated visibility lift.",
    href: "/opportunities",
    linkLabel: "Open opportunities",
  },
  {
    icon: Wand2,
    title: "7. Optimize content for answers",
    body: "The Content Optimizer audits any page against answer-engine best practices: extractable paragraphs, question headings, FAQ schema, cited statistics, freshness signals, and crawler access.",
    href: "/optimize",
    linkLabel: "Audit a page",
  },
];

const FAQS = [
  {
    q: "What is AEO?",
    a: "Answer Engine Optimization — the practice of improving how AI assistants (ChatGPT, Perplexity, Gemini, and others) mention, rank, and describe your brand when users ask them questions. It's SEO for the conversational layer.",
  },
  {
    q: "How is this different from SEO rank tracking?",
    a: "Search returns ten links; answer engines return one synthesized answer. Instead of a page-one ranking, you're competing for inclusion in that answer, a favorable position within it, and accurate framing. BrandSignal measures all three.",
  },
  {
    q: "How often should I scan?",
    a: "Weekly is the sweet spot for most brands. Engine behavior shifts with model updates and new citations, but daily scans mostly add noise. Run manual scans after publishing major content or shipping pricing changes.",
  },
  {
    q: "Where does the competitive data come from?",
    a: "Every answer from every scan is parsed for all brand mentions — not just yours. Share of voice and competitor mention rates come from the same underlying answers, so comparisons are apples-to-apples.",
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="How BrandSignal works"
        description="A practical loop for winning visibility in AI answers: track prompts, scan engines, understand the gaps, then fix them."
      />

      {/* Hero explainer */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-accent/15 blur-3xl" />
        <CardContent className="relative px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft sm:flex">
              <Bot className="size-5 text-accent-strong" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Your buyers stopped Googling. Their AI answers for them.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-strong">
                When someone asks ChatGPT for &ldquo;the best CRM for a
                50-person B2B team&rdquo;, the answer names three or four
                products — and most buyers never look past it. BrandSignal
                treats that answer as the new search results page: it measures
                whether you&apos;re in it, how you&apos;re framed, which
                sources the engine trusted, and exactly what to change to show
                up more often.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="accent">5 answer engines</Badge>
                <Badge tone="info">Weekly automated scans</Badge>
                <Badge tone="positive">Prioritized fixes</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          The loop
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {STEPS.map((step) => (
            <Card key={step.title} className="flex flex-col p-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-accent-soft">
                <step.icon className="size-4.5 text-accent-strong" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
              <Link
                href={step.href}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-strong hover:underline"
              >
                {step.linkLabel} <ArrowRight className="size-3" />
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Common questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <Card key={faq.q} className="p-5">
              <h3 className="text-sm font-semibold text-foreground">{faq.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {faq.a}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
