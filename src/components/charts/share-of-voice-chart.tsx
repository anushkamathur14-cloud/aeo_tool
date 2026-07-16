"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { COMPETITORS, SENTIMENT_BREAKDOWN } from "@/lib/demo-data";
import { CHART_COLORS, ChartTooltip } from "./chart-theme";

const SOV_COLORS: Record<string, string> = {
  netflix: CHART_COLORS.netflix,
  prime: CHART_COLORS.prime,
  hulu: CHART_COLORS.hulu,
  peacock: CHART_COLORS.peacock,
  disney: CHART_COLORS.disney,
  max: CHART_COLORS.max,
};

export function ShareOfVoiceChart() {
  const data = COMPETITORS.map((c) => ({
    name: c.name,
    value: c.shareOfVoice,
    id: c.id,
  }));
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={220} className="max-w-[240px]">
        <PieChart>
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={90}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.id}
                fill={SOV_COLORS[entry.id]}
                fillOpacity={entry.id === "peacock" ? 1 : 0.55}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <ul className="w-full space-y-2">
        {data.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-2 text-muted-strong">
              <span
                className="size-2 rounded-full"
                style={{ background: SOV_COLORS[entry.id] }}
              />
              {entry.name}
              {entry.id === "peacock" && (
                <span className="rounded bg-accent-soft px-1 py-px text-[10px] font-semibold text-accent-strong">
                  You
                </span>
              )}
            </span>
            <span className="font-medium text-foreground">
              {entry.value.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SentimentDonut() {
  return (
    <div className="flex items-center gap-5">
      <ResponsiveContainer width={130} height={130}>
        <PieChart>
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Pie
            data={SENTIMENT_BREAKDOWN}
            dataKey="value"
            nameKey="name"
            innerRadius={38}
            outerRadius={58}
            paddingAngle={3}
            strokeWidth={0}
          >
            {SENTIMENT_BREAKDOWN.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={0.9} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <ul className="space-y-2">
        {SENTIMENT_BREAKDOWN.map((s) => (
          <li key={s.name} className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full" style={{ background: s.color }} />
            <span className="text-muted-strong">{s.name}</span>
            <span className="font-semibold text-foreground">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
