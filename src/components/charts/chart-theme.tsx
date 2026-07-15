"use client";

export const CHART_COLORS = {
  novacrm: "#7c6cf6",
  hubspot: "#f59e0b",
  salesforce: "#38bdf8",
  pipedrive: "#34d399",
  attio: "#f472b6",
  grid: "#23232f",
  axis: "#8b8b9e",
};

export const AXIS_PROPS = {
  stroke: "transparent",
  tick: { fill: CHART_COLORS.axis, fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

interface TooltipEntry {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueSuffix = "",
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipEntry>;
  label?: string | number;
  valueSuffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-raised px-3 py-2 shadow-xl">
      {label ? (
        <p className="mb-1.5 text-[11px] font-medium text-muted">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div
            key={String(entry.dataKey ?? entry.name)}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-1.5 text-muted-strong">
              <span
                className="size-2 rounded-full"
                style={{ background: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-foreground">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
              {valueSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
