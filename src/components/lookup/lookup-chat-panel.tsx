"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { defaultFollowUps, type LookupChatContext } from "@/lib/agents/chat-agent";
import { cn } from "@/lib/utils";

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export function LookupChatPanel({ context }: { context: LookupChatContext }) {
  const brand = context.brand || "this category";
  const suggestions = useMemo(() => defaultFollowUps(context), [context]);
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: "assistant",
      content: `I can answer follow-ups about this ${context.mode} lookup for ${brand}. Ask about mention rate, engines, gaps, competitors, or fan-outs.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `I can answer follow-ups about this ${context.mode} lookup for ${brand}. Ask about mention rate, engines, gaps, competitors, or fan-outs.`,
      },
    ]);
    setInput("");
    setError(null);
  }, [brand, context.mode, context.mentionCount, context.category]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (trimmed.length < 2 || isSending) return;

    setError(null);
    setIsSending(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    try {
      const response = await fetch("/api/v1/lookup/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, context }),
      });
      const payload = (await response.json()) as {
        answer?: string;
        error?: string;
        suggestedFollowUps?: string[];
      };
      if (!response.ok) throw new Error(payload.error ?? "Chat failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: payload.answer ?? "I couldn't answer that from this lookup.",
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong answering that. Try another question from the chips below.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="size-4 text-accent-strong" />
          Ask about this lookup
        </CardTitle>
        <CardDescription>
          Chat agent grounded in this run — stats, appearance context, engines, and fan-outs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto rounded-lg border border-border bg-surface-raised p-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "max-w-[92%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                message.role === "user"
                  ? "ml-auto bg-accent-soft text-accent-strong"
                  : "mr-auto bg-surface text-muted-strong border border-border",
              )}
            >
              {message.content}
            </div>
          ))}
          {isSending ? (
            <div className="mr-auto inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
              <Loader2 className="size-3.5 animate-spin" />
              Thinking from this lookup…
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isSending}
              onClick={() => void ask(suggestion)}
              className="rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-muted-strong transition-colors hover:border-accent/40 hover:text-foreground cursor-pointer disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void ask(input);
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={`Ask anything about ${brand}…`}
            className="h-11 flex-1 rounded-lg border border-border bg-surface-raised px-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            aria-label="Ask a follow-up question"
          />
          <Button type="submit" variant="primary" disabled={isSending || input.trim().length < 2}>
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Ask
          </Button>
        </form>

        {error ? (
          <p className="text-xs text-warning">{error}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">Grounded in this run</Badge>
            <Badge>{context.mode === "live" ? "Live lookup" : "Demo lookup"}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
