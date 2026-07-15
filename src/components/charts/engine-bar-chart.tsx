"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ENGINES } from "@/lib/demo-data";
import { AXIS_PROPS, CHART_COLORS, ChartTooltip } from "./chart-theme";

export function EngineBarChart() {
  const data = ENGINES.map((e) => ({
    name: e.name,
    "Mention rate": e.mentionRate,
    color: e.color,
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" {...AXIS_PROPS} />
        <YAxis {...AXIS_PROPS} domain={[0, 100]} />
        <Tooltip
          content={<ChartTooltip valueSuffix="%" />}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="Mention rate" radius={[6, 6, 0, 0]} maxBarSize={44}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
