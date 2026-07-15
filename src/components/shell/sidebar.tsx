"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileText,
  History,
  Home,
  LayoutDashboard,
  Lightbulb,
  MessageSquareText,
  Network,
  Radar,
  Search,
  Settings,
  Swords,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/demo-data";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Home", icon: Home },
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/guide", label: "How it works", icon: BookOpen },
    ],
  },
  {
    label: "Measure",
    items: [
      { href: "/scanner", label: "Scanner", icon: Radar },
      { href: "/lookup", label: "Brand lookup", icon: Search },
      { href: "/prompts", label: "Prompts", icon: MessageSquareText },
      { href: "/history", label: "History", icon: History },
    ],
  },
  {
    label: "Understand",
    items: [
      { href: "/competitors", label: "Competitors", icon: Swords },
      { href: "/entities", label: "Entity Graph", icon: Network },
    ],
  },
  {
    label: "Improve",
    items: [
      { href: "/opportunities", label: "AEO opportunities", icon: Lightbulb },
      { href: "/optimize", label: "Content Optimizer", icon: Wand2 },
      { href: "/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex size-7 items-center justify-center rounded-lg bg-accent shadow-[0_0_16px_rgba(45,212,191,0.35)]">
              <BarChart3 className="size-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              BrandSignal
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted hover:bg-surface-hover hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                          active
                            ? "bg-accent-soft font-medium text-accent-strong"
                            : "text-muted-strong hover:bg-surface-hover hover:text-foreground"
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-surface-raised px-3 py-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-info text-xs font-bold text-white">
              N
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {BRAND.name}
              </p>
              <p className="truncate text-[11px] text-muted">{BRAND.domain}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
