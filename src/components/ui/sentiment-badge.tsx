import { Badge } from "./badge";
import type { Sentiment } from "@/lib/demo-data";

const config: Record<Sentiment, { tone: "positive" | "default" | "negative"; label: string }> = {
  positive: { tone: "positive", label: "Positive" },
  neutral: { tone: "default", label: "Neutral" },
  negative: { tone: "negative", label: "Negative" },
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const { tone, label } = config[sentiment];
  return <Badge tone={tone}>{label}</Badge>;
}
