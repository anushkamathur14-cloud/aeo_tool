import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Coins,
  Layers3,
  Lightbulb,
  MessageSquareText,
  Network,
  Radar,
  Search,
  Sparkles,
  Swords,
  Tags,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "How it works" };

const QUESTIONS = [
  "Does AI know my brand?",
  "When does AI recommend me?",
  "Why are competitors recommended instead?",
  "What should I change to improve visibility?",
];

const AGENTS = [
  {
    icon: Radar,
    name: "Query agent",
    body: "Builds buyer-style prompts for your brand/category, sends them to configured answer engines, and keeps an estimated cost ledger so live runs stay controlled.",
  },
  {
    icon: MessageSquareText,
    name: "Evaluation agent",
    body: "Reads each answer for brand inclusion, mention order, peer brands, and recommendation language — the raw inputs for share of voice.",
  },
  {
    icon: Tags,
    name: "Classification agent",
    body: "Labels every prompt/answer by intent (best-of, comparison, pricing, alternatives), journey stage, and sentiment.",
  },
  {
    icon: Network,
    name: "Fan-out agent",
    body: "Expands commercial prompts into informational evidence queries and navigational brand-checks — the pattern AI Overviews use before recommending. Recommendation beats citation.",
  },
  {
    icon: Sparkles,
    name: "FAQ agent",
    body: "Turns the run into plain-language FAQs: how often you were mentioned, who leads the category, fan-out brand-check wins, and what to do next.",
  },
];

const STEPS = [
  {
    icon: Search,
    title: "1. Look up a brand or category",
    body: "Enter any brand (Peacock, Netflix, Chewy) and/or a category (best OTT platform, pets, dog food). BrandSignal generates realistic buyer prompts — then measures who shows up in the answers.",
    href: "/lookup",
    linkLabel: "Open brand lookup",
  },
  {
    icon: Layers3,
    title: "2. Choose Live or Demo",
    body: "Live mode queries only engines with your API keys and never silently swaps in sample answers. Demo mode is opt-in sample data for walkthroughs — including the Peacock OTT workspace.",
    href: "/settings",
    linkLabel: "Add API keys",
  },
  {
    icon: Bot,
    title: "3. Run the agent pipeline",
    body: "Query → Evaluation → Classification → Fan-out → FAQ. Results open with stats, then FAQs / where the brand shows up, then a chat agent for follow-up questions.",
    href: "/lookup",
    linkLabel: "Try a lookup",
  },
  {
    icon: Radar,
    title: "4. Scan tracked prompts across engines",
    body: "For continuous monitoring, Scanner asks the workspace prompt set across ChatGPT, Claude, Perplexity, Gemini, and Copilot — capturing mentions, sentiment, and citations.",
    href: "/scanner",
    linkLabel: "Run a scan",
  },
  {
    icon: TrendingUp,
    title: "5. Track the BrandSignal Visibility Score",
    body: "Scans roll into a 0–100 visibility score (mention rate, rank, citations, sentiment, competitor share, and more). History shows weekly movement by engine.",
    href: "/history",
    linkLabel: "See history",
  },
  {
    icon: Swords,
    title: "6. Benchmark OTT competitors",
    body: "The Peacock demo compares against Netflix, Amazon Prime Video, Hulu, Disney+, and Max — share of voice, head-to-head mentions, and which engines favor whom.",
    href: "/competitors",
    linkLabel: "View competitors",
  },
  {
    icon: Network,
    title: "7. Inspect the entity graph",
    body: "Answer engines reason about entities. See which features, audiences, and sources models associate with Peacock — and where those associations are weak.",
    href: "/entities",
    linkLabel: "Open entity graph",
  },
  {
    icon: Lightbulb,
    title: "8. Act on AEO opportunities",
    body: "Gaps become a prioritized backlog: comparison content, citations, FAQ/schema, crawler access, entity strength — each with expected visibility lift and effort.",
    href: "/opportunities",
    linkLabel: "View AEO opportunities",
  },
  {
    icon: Wand2,
    title: "9. Optimize pages for answer extraction",
    body: "Content Optimizer checks citability: short answer snippets, question H2s, FAQ schema, supporting stats, and internal links answer engines can trust.",
    href: "/optimize",
    linkLabel: "Audit a page",
  },
];

const DEMO_PATH = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/competitors", label: "Competitors" },
  { href: "/prompts", label: "One prompt" },
  { href: "/opportunities", label: "AEO opportunities" },
  { href: "/lookup", label: "Live/demo lookup" },
  { href: "/settings", label: "API keys" },
];

const FAQS = [
  {
    q: "What is AEO?",
    a: "Answer Engine Optimization — improving how AI assistants (ChatGPT, Perplexity, Gemini, Claude, Grok, and others) mention, rank, and describe your brand when users ask them questions. It’s SEO for the conversational layer.",
  },
  {
    q: "What’s in the demo workspace?",
    a: "Demo data follows Peacock (peacocktv.com), a real NBCUniversal OTT brand, against Netflix, Amazon Prime Video, Hulu, Disney+, and Max. Use it to tour the product. Switch Brand lookup to Demo for sample OTT answers, or Live when you add keys.",
  },
  {
    q: "If I enter Chewy or Netflix, what happens?",
    a: "BrandSignal generates category prompts (best dog food / best OTT platform, alternatives, comparisons, pricing, where to buy). Engines answer those prompts. We count how often your brand appears, at what position, and share of voice versus peers.",
  },
  {
    q: "Live vs Demo — what’s the difference?",
    a: "Live calls only engines you’ve configured with API keys and tracks estimated token cost. Demo is optional sample data for walkthroughs. Live never silently substitutes demo answers.",
  },
  {
    q: "How is this different from SEO rank tracking?",
    a: "Search returns ten links; answer engines return one synthesized answer. You’re competing for inclusion, favorable position, and accurate framing. BrandSignal measures all three.",
  },
  {
    q: "What do the agents do?",
    a: "Query sends prompts and maintains cost. Evaluation scores mentions and recommendations. Classification labels intent and journey stage. Fan-out maps commercial prompts into informational evidence and navigational brand-checks. FAQ explains the run in plain language.",
  },
  {
    q: "What is a fan-out evidence map?",
    a: "Before recommending, answer engines expand a commercial question into related searches — facts to justify a pick, plus brand-by-name lookups. Being recommended matters more than being cited; your informational pages are often the evidence layer under commercial prompts.",
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="How BrandSignal works"
        description="AI Visibility Intelligence for AEO — measure how answer engines talk about your brand, explain why competitors win, and prioritize what to fix."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Open dashboard <ArrowRight className="size-3.5" />
              </Button>
            </Link>
            <Link href="/lookup">
              <Button variant="secondary" size="sm">
                Try brand lookup
              </Button>
            </Link>
          </div>
        }
      />

      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-accent/15 blur-3xl" />
        <CardContent className="relative space-y-5 px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft sm:flex">
              <Bot className="size-5 text-accent-strong" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Your buyers ask AI — not just Google
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-strong">
                When someone asks ChatGPT for &ldquo;the best OTT platform&rdquo;,
                the answer names a short list — Netflix, Hulu, Prime Video, and
                maybe Peacock. BrandSignal treats that answer as the new SERP:
                were you mentioned, at what position, with what framing, citing
                which sources, and what would raise your AEO visibility next.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="accent">OTT demo · Peacock</Badge>
                <Badge tone="info">Live + opt-in demo lookup</Badge>
                <Badge tone="positive">5-agent pipeline</Badge>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              The four questions
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {QUESTIONS.map((question, index) => (
                <div
                  key={question}
                  className="rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-muted-strong"
                >
                  <span className="mr-2 font-semibold text-accent-strong">{index + 1}.</span>
                  {question}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          The 4 agents
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {AGENTS.map((agent) => (
            <Card key={agent.name} className="p-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-accent-soft">
                <agent.icon className="size-4 text-accent-strong" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{agent.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{agent.body}</p>
            </Card>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Coins className="size-3.5" />
          Live runs show estimated query cost from the Query agent’s ledger.
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          The product loop
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.title} className="flex flex-col p-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-accent-soft">
                <step.icon className="size-4 text-accent-strong" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{step.body}</p>
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

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-foreground">Suggested demo path</h2>
        <p className="mt-1 text-sm text-muted">
          A fast investor/customer walkthrough using the Peacock OTT sample workspace.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {DEMO_PATH.map((item, index) => (
            <div key={item.href} className="flex items-center gap-2">
              <Link href={item.href}>
                <Badge tone="accent" className="cursor-pointer hover:opacity-90">
                  {index + 1}. {item.label}
                </Badge>
              </Link>
              {index < DEMO_PATH.length - 1 ? (
                <ArrowRight className="size-3 text-muted" />
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Glossary
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            {
              term: "Mention rate",
              def: "Share of answers where your brand appears at least once.",
            },
            {
              term: "Share of voice",
              def: "How often your brand appears versus peers across the same prompt set.",
            },
            {
              term: "Average position",
              def: "Typical rank order when your brand is listed among recommended options.",
            },
            {
              term: "Citation",
              def: "A source the model points to when justifying an answer — useful, but recommendation is the commercial goal.",
            },
            {
              term: "Fan-out",
              def: "Related searches an answer engine runs under a commercial prompt: informational evidence plus navigational brand-checks.",
            },
            {
              term: "Evidence map",
              def: "The tree of fan-out queries under a commercial root — what proof and brand pages engines need before recommending you.",
            },
            {
              term: "Entity",
              def: "A concept models associate with you — product, feature, audience, competitor, or topic.",
            },
            {
              term: "Recommendation strength",
              def: "How strongly the answer endorses a brand versus merely naming it.",
            },
          ].map((item) => (
            <Card key={item.term} className="p-4">
              <h3 className="text-sm font-semibold text-foreground">{item.term}</h3>
              <p className="mt-1 text-sm text-muted">{item.def}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Common questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <Card key={faq.q} className="p-5">
              <h3 className="text-sm font-semibold text-foreground">{faq.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
