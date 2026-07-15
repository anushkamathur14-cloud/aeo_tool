import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Delta({
  value,
  suffix = "",
  invert = false,
  className,
}: {
  value: number;
  suffix?: string;
  /** When true, a decrease is good (e.g. average position). */
  invert?: boolean;
  className?: string;
}) {
  const isZero = Math.abs(value) < 0.05;
  const isGood = invert ? value < 0 : value > 0;
  const Icon = isZero ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isZero ? "text-muted" : isGood ? "text-positive" : "text-negative",
        className
      )}
    >
      <Icon className="size-3.5" />
      {value > 0 ? "+" : ""}
      {value.toFixed(Math.abs(value) % 1 === 0 ? 0 : 1)}
      {suffix}
    </span>
  );
}
