import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  color,
  className,
  trackClassName,
}: {
  value: number; // 0-100
  color?: string;
  className?: string;
  trackClassName?: string;
}) {
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-surface-hover",
        trackClassName
      )}
    >
      <div
        className={cn("h-full rounded-full bg-accent transition-all duration-500", className)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, ...(color ? { background: color } : {}) }}
      />
    </div>
  );
}
