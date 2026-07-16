"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Radar, Sparkles } from "lucide-react";
import { Sidebar } from "./sidebar";
import { DASHBOARD_STATS } from "@/lib/demo-data";
import { formatDateTime } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-dvh flex-col lg:pl-64">
        {/* Demo banner */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-accent/20 bg-accent-soft px-4 py-1.5 text-center">
          <Sparkles className="size-3.5 shrink-0 text-accent-strong" />
          <p className="text-xs text-accent-strong">
            Demo workspace — Dashboard & Competitors use sample Peacock data. Brand lookup can check any brand (Live or Demo).
          </p>
          <Link href="/guide" className="text-xs font-semibold text-accent-strong underline-offset-2 hover:underline">
            How it works
          </Link>
        </div>

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-muted hover:bg-surface-hover hover:text-foreground lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden items-center gap-2 text-xs text-muted sm:flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-positive opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-positive" />
              </span>
              Last scan {formatDateTime(DASHBOARD_STATS.lastScan)} · 5 engines
            </div>
          </div>
          <Link
            href="/scanner"
            className="inline-flex h-8 items-center gap-2 rounded-lg bg-accent px-3 text-xs font-medium text-white transition-colors hover:bg-accent-strong"
          >
            <Radar className="size-3.5" />
            Run scan
          </Link>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
