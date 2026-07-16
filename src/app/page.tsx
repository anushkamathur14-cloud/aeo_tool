import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  Lightbulb,
  MessageSquareText,
  Radar,
  Search,
  Swords,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Home",
  description: "BrandSignal — AI Visibility Intelligence for Answer Engine Optimization (AEO).",
};

const DESTINATIONS = [
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "Executive view of visibility score, engines, and trends.",
    icon: LayoutDashboard,
  },
  {
    href: "/lookup",
    title: "Brand lookup",
    description: "Look up Pedigree, Chewy, pets, dogs, or any brand/category.",
    icon: Search,
  },
  {
    href: "/opportunities",
    title: "AEO opportunities",
    description: "Prioritized actions to improve AI answer visibility.",
    icon: Lightbulb,
  },
  {
    href: "/scanner",
    title: "Scanner",
    description: "Run multi-engine prompt scans and capture mentions.",
    icon: Radar,
  },
  {
    href: "/prompts",
    title: "Prompt Explorer",
    description: "Inspect answers, citations, and mention order by prompt.",
    icon: MessageSquareText,
  },
  {
    href: "/competitors",
    title: "Competitors",
    description: "Share of AI answers and competitive gaps.",
    icon: Swords,
  },
  {
    href: "/guide",
    title: "How it works",
    description: "AEO loop: measure, explain, improve.",
    icon: BookOpen,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative max-w-2xl space-y-4">
          <Badge tone="accent">BrandSignal demo</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            AI Visibility Intelligence
          </h1>
          <p className="text-sm leading-relaxed text-muted-strong sm:text-base">
            See whether answer engines know your brand, when they recommend you,
            why competitors win instead, and what to change to improve visibility
            in ChatGPT, Claude, Gemini, Perplexity, and more.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/dashboard">
              <Button variant="primary">
                Open dashboard <ArrowRight className="size-3.5" />
              </Button>
            </Link>
            <Link href="/lookup">
              <Button variant="secondary">Look up a brand</Button>
            </Link>
            <Link href="/opportunities">
              <Button variant="ghost">View AEO opportunities</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {DESTINATIONS.map((item) => (
          <Link key={item.href} href={item.href} className="group block">
            <Card className="h-full transition-colors group-hover:border-accent/40 group-hover:bg-surface-raised">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-accent-soft">
                  <item.icon className="size-4 text-accent-strong" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-accent-strong">
                  Open <ArrowRight className="size-3" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
