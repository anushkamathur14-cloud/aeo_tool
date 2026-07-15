"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Lightbulb,
  Loader2,
  MessageSquareText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  OPPORTUNITIES,
  getPromptById,
  type Opportunity,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | Opportunity["status"];

const IMPACT_TONE: Record<Opportunity["impact"], "accent" | "info" | "default"> = {
  high: "accent",
  medium: "info",
  low: "default",
};

const STATUS_META: Record<
  Opportunity["status"],
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  new: { label: "New", icon: CircleDashed, className: "text-info" },
  "in-progress": { label: "In progress", icon: Loader2, className: "text-warning" },
  done: { label: "Done", icon: CheckCircle2, className: "text-positive" },
};

export function OpportunitiesClient() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(OPPORTUNITIES[0].id);

  const filtered = useMemo(() => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return OPPORTUNITIES.filter(
      (o) => statusFilter === "all" || o.status === statusFilter
    ).sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
  }, [statusFilter]);

  const counts = {
    all: OPPORTUNITIES.length,
    new: OPPORTUNITIES.filter((o) => o.status === "new").length,
    "in-progress": OPPORTUNITIES.filter((o) => o.status === "in-progress").length,
    done: OPPORTUNITIES.filter((o) => o.status === "done").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        description="A prioritized backlog of moves to improve how answer engines mention NovaCRM, generated from scan findings."
      />

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["all", "All"],
            ["new", "New"],
            ["in-progress", "In progress"],
            ["done", "Done"],
          ] as [StatusFilter, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              statusFilter === value
                ? "bg-accent-soft text-accent-strong"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            )}
          >
            {label}
            <span className="ml-1.5 text-[10px] opacity-70">{counts[value]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Nothing here"
          description="No opportunities match this filter. New ones appear automatically after each scan."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((opp) => {
            const expanded = expandedId === opp.id;
            const status = STATUS_META[opp.status];
            const StatusIcon = status.icon;
            return (
              <Card key={opp.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : opp.id)}
                  className="flex w-full items-center gap-3 p-4 text-left cursor-pointer hover:bg-surface-raised transition-colors"
                >
                  <StatusIcon className={cn("size-4 shrink-0", status.className)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {opp.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {opp.estimatedLift}
                    </p>
                  </div>
                  <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                    <Badge tone={IMPACT_TONE[opp.impact]} className="capitalize">
                      {opp.impact} impact
                    </Badge>
                    <Badge className="capitalize">{opp.effort} effort</Badge>
                    <Badge tone="default">{opp.category}</Badge>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted transition-transform",
                      expanded && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t border-border px-4 py-4 sm:px-12">
                        <p className="text-sm leading-relaxed text-muted-strong">
                          {opp.description}
                        </p>

                        <div className="mt-4">
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                            Recommended actions
                          </p>
                          <ul className="space-y-2">
                            {opp.actions.map((action, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2.5 text-sm text-muted-strong"
                              >
                                <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent-strong">
                                  {i + 1}
                                </span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {opp.relatedPromptIds.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                              Related prompts
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {opp.relatedPromptIds.map((pid) => {
                                const prompt = getPromptById(pid);
                                if (!prompt) return null;
                                return (
                                  <Link
                                    key={pid}
                                    href={`/prompts/${pid}`}
                                    className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-muted-strong transition-colors hover:border-border-strong hover:text-foreground"
                                  >
                                    <MessageSquareText className="size-3 shrink-0" />
                                    <span className="truncate">{prompt.text}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
