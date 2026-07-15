"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Save,
  Trash2,
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
import { BRAND, ENGINES } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

import { STORAGE_PREFIX } from "@/lib/keys";

const KEY_FIELDS = [
  { id: "openai", label: "OpenAI API key", placeholder: "sk-…", engine: "ChatGPT" },
  { id: "anthropic", label: "Anthropic API key", placeholder: "sk-ant-…", engine: "Claude" },
  { id: "perplexity", label: "Perplexity API key", placeholder: "pplx-…", engine: "Perplexity" },
  { id: "google", label: "Google AI API key", placeholder: "AIza…", engine: "Gemini" },
  { id: "xai", label: "xAI API key", placeholder: "xai-…", engine: "Grok" },
] as const;

function maskKey(value: string) {
  if (value.length <= 8) return "•".repeat(value.length);
  return `${value.slice(0, 4)}${"•".repeat(Math.min(20, value.length - 8))}${value.slice(-4)}`;
}

export function SettingsClient() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [savedFlash, setSavedFlash] = useState<string | null>(null);
  const [scanDay, setScanDay] = useState("monday");
  const [emailDigest, setEmailDigest] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored: Record<string, string> = {};
    for (const field of KEY_FIELDS) {
      const v = localStorage.getItem(STORAGE_PREFIX + field.id);
      if (v) stored[field.id] = v;
    }
    setKeys(stored);
    setScanDay(localStorage.getItem(STORAGE_PREFIX + "scanDay") ?? "monday");
    setEmailDigest(
      localStorage.getItem(STORAGE_PREFIX + "emailDigest") !== "false"
    );
    setLoaded(true);
  }, []);

  const saveKey = (id: string) => {
    const value = drafts[id]?.trim();
    if (!value) return;
    localStorage.setItem(STORAGE_PREFIX + id, value);
    setKeys((prev) => ({ ...prev, [id]: value }));
    setDrafts((prev) => ({ ...prev, [id]: "" }));
    setSavedFlash(id);
    setTimeout(() => setSavedFlash(null), 1800);
  };

  const removeKey = (id: string) => {
    localStorage.removeItem(STORAGE_PREFIX + id);
    setKeys((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setVisible((prev) => ({ ...prev, [id]: false }));
  };

  const updateScanDay = (day: string) => {
    setScanDay(day);
    localStorage.setItem(STORAGE_PREFIX + "scanDay", day);
  };

  const toggleDigest = () => {
    setEmailDigest((prev) => {
      localStorage.setItem(STORAGE_PREFIX + "emailDigest", String(!prev));
      return !prev;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Workspace configuration. Keys stay in your browser until you run a live scan, when they are sent only over HTTPS to BrandSignal's scan endpoint."
      />

      {/* Brand */}
      <Card>
        <CardHeader>
          <CardTitle>Tracked brand</CardTitle>
          <CardDescription>
            The sample brand BrandSignal is monitoring across answer engines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-raised p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-info text-sm font-bold text-white">
              N
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {BRAND.name}
                </p>
                <Badge tone="accent">Demo</Badge>
              </div>
              <p className="text-xs text-muted">{BRAND.domain} · {BRAND.category}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-muted" />
            Answer engine API keys
          </CardTitle>
          <CardDescription>
            Keys are masked after saving and kept in localStorage. When present,
            Scanner runs a capped hybrid live scan for those engines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loaded ? (
            <div className="space-y-3">
              {KEY_FIELDS.map((f) => (
                <div key={f.id} className="skeleton h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            KEY_FIELDS.map((field) => {
              const saved = keys[field.id];
              const isVisible = visible[field.id];
              return (
                <div
                  key={field.id}
                  className="rounded-lg border border-border bg-surface-raised p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {field.label}
                      </p>
                      <Badge>{field.engine}</Badge>
                    </div>
                    {saved ? (
                      <Badge tone="positive">
                        <Check className="size-3" /> Configured
                      </Badge>
                    ) : (
                      <Badge>Not set</Badge>
                    )}
                  </div>

                  {saved ? (
                    <div className="mt-3 flex items-center gap-2">
                      <code className="flex-1 truncate rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-muted-strong">
                        {isVisible ? saved : maskKey(saved)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setVisible((prev) => ({
                            ...prev,
                            [field.id]: !prev[field.id],
                          }))
                        }
                        aria-label={isVisible ? "Hide key" : "Show key"}
                      >
                        {isVisible ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeKey(field.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="password"
                        value={drafts[field.id] ?? ""}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [field.id]: e.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        className="h-9 flex-1 rounded-md border border-border bg-surface px-3 font-mono text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={!drafts[field.id]?.trim()}
                        onClick={() => saveKey(field.id)}
                      >
                        {savedFlash === field.id ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Save className="size-3.5" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Scan schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Scan schedule</CardTitle>
          <CardDescription>
            When the weekly automated scan runs (09:00 UTC)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-1.5">
            {["monday", "tuesday", "wednesday", "thursday", "friday"].map(
              (day) => (
                <button
                  key={day}
                  onClick={() => updateScanDay(day)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors cursor-pointer",
                    scanDay === day
                      ? "bg-accent-soft text-accent-strong"
                      : "border border-border text-muted hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  {day}
                </button>
              )
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-raised p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Weekly email digest
              </p>
              <p className="text-xs text-muted">
                Send the visibility summary after each scheduled scan
              </p>
            </div>
            <button
              role="switch"
              aria-checked={emailDigest}
              onClick={toggleDigest}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer",
                emailDigest ? "bg-accent" : "bg-surface-hover border border-border-strong"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                  emailDigest ? "translate-x-5.5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Tracked engines */}
      <Card>
        <CardHeader>
          <CardTitle>Tracked engines</CardTitle>
          <CardDescription>
            Engines included in scans and reporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ENGINES.map((engine) => (
              <div
                key={engine.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: engine.color }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {engine.name}
                  </p>
                  <p className="text-[11px] text-muted">{engine.vendor}</p>
                </div>
                <Badge tone="positive">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
