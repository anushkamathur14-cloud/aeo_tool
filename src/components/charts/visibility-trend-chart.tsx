"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { VISIBILITY_TREND } from "@/lib/demo-data";
import { AXIS_PROPS, CHART_COLORS, ChartTooltip } from "./chart-theme";

export function VisibilityTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={VISIBILITY_TREND} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="streamoraFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.streamora} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.streamora} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" {...AXIS_PROPS} interval="preserveStartEnd" />
        <YAxis {...AXIS_PROPS} domain={[0, 100]} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: CHART_COLORS.grid }} />
        <Area
          type="monotone"
          dataKey="streamora"
          name="Streamora"
          stroke={CHART_COLORS.streamora}
          strokeWidth={2.5}
          fill="url(#streamoraFill)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CompetitorTrendChart() {
  const series = [
    { key: "streamora", name: "Streamora", color: CHART_COLORS.streamora, width: 2.5 },
    { key: "netflix", name: "Netflix", color: CHART_COLORS.netflix, width: 1.5 },
    { key: "prime", name: "Prime Video", color: CHART_COLORS.prime, width: 1.5 },
    { key: "hulu", name: "Hulu", color: CHART_COLORS.hulu, width: 1.5 },
    { key: "disney", name: "Disney+", color: CHART_COLORS.disney, width: 1.5 },
    { key: "max", name: "Max", color: CHART_COLORS.max, width: 1.5 },
  ];
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={VISIBILITY_TREND} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" {...AXIS_PROPS} interval="preserveStartEnd" />
        <YAxis {...AXIS_PROPS} domain={[0, 100]} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: CHART_COLORS.grid }} />
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: 12, color: CHART_COLORS.axis, paddingTop: 8 }}
        />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={s.width}
            dot={false}
            activeDot={{ r: 3.5 }}
            opacity={s.key === "streamora" ? 1 : 0.75}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
