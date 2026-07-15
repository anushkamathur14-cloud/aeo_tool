import { ENGINE_LOOKUP, type EngineId } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function EngineBadge({
  engineId,
  className,
}: {
  engineId: EngineId;
  className?: string;
}) {
  const engine = ENGINE_LOOKUP[engineId];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-muted-strong",
        className
      )}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: engine.color }}
      />
      {engine.name}
    </span>
  );
}
