import { cn } from "@/lib/utils";

type Tone =
  | "default"
  | "accent"
  | "positive"
  | "negative"
  | "warning"
  | "info";

const tones: Record<Tone, string> = {
  default: "bg-surface-hover text-muted-strong border-border",
  accent: "bg-accent-soft text-accent-strong border-transparent",
  positive: "bg-positive-soft text-positive border-transparent",
  negative: "bg-negative-soft text-negative border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  info: "bg-info-soft text-info border-transparent",
};

export function Badge({
  tone = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
