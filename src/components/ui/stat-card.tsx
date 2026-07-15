import type { LucideIcon } from "lucide-react";
import { Card } from "./card";
import { Delta } from "./delta";

export function StatCard({
  label,
  value,
  delta,
  deltaSuffix,
  deltaInvert,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaSuffix?: string;
  deltaInvert?: boolean;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent-soft">
          <Icon className="size-4 text-accent-strong" />
        </div>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        {delta !== undefined ? (
          <Delta value={delta} suffix={deltaSuffix} invert={deltaInvert} />
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </Card>
  );
}
