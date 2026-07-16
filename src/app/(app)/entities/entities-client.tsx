"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Network } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Delta } from "@/components/ui/delta";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  ENTITY_EDGES,
  ENTITY_NODES,
  type EntityNode,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<EntityNode["type"], string> = {
  brand: "#7c6cf6",
  category: "#38bdf8",
  feature: "#34d399",
  audience: "#fbbf24",
  competitor: "#f87171",
  source: "#f472b6",
};

const TYPE_LABELS: Record<EntityNode["type"], string> = {
  brand: "Brand",
  category: "Category",
  feature: "Feature",
  audience: "Audience",
  competitor: "Competitor",
  source: "Citation source",
};

const SIZE = 560;
const CENTER = SIZE / 2;

export function EntitiesClient() {
  const [selectedId, setSelectedId] = useState<string>("ott-streaming");
  const [typeFilter, setTypeFilter] = useState<EntityNode["type"] | "all">("all");

  const satellites = useMemo(
    () => ENTITY_NODES.filter((n) => n.id !== "streamora"),
    []
  );

  // Radial layout: distance from center inversely proportional to strength
  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    map.set("streamora", { x: CENTER, y: CENTER });
    satellites.forEach((node, i) => {
      const angle = (i / satellites.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 90 + (100 - node.strength) * 1.55;
      map.set(node.id, {
        x: CENTER + Math.cos(angle) * radius,
        y: CENTER + Math.sin(angle) * radius,
      });
    });
    return map;
  }, [satellites]);

  const selected = ENTITY_NODES.find((n) => n.id === selectedId) ?? ENTITY_NODES[1];
  const connectedIds = useMemo(() => {
    const set = new Set<string>();
    ENTITY_EDGES.forEach((e) => {
      if (e.source === selectedId) set.add(e.target);
      if (e.target === selectedId) set.add(e.source);
    });
    return set;
  }, [selectedId]);

  const listNodes = satellites
    .filter((n) => typeFilter === "all" || n.type === typeFilter)
    .sort((a, b) => b.strength - a.strength);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entity Graph"
        description="What answer engines associate with Streamora — the concepts, audiences, competitors, and sources that co-occur in AI answers. Stronger associations sit closer to the center."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Graph */}
        <Card className="xl:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Association map</CardTitle>
              <CardDescription>
                Click any node to inspect the association
              </CardDescription>
            </div>
            <Network className="size-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="mx-auto max-w-[560px]">
              <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="w-full"
                role="img"
                aria-label="Entity association graph centered on Streamora"
              >
                {/* Orbit rings */}
                {[100, 160, 220].map((r) => (
                  <circle
                    key={r}
                    cx={CENTER}
                    cy={CENTER}
                    r={r}
                    fill="none"
                    stroke="var(--border)"
                    strokeDasharray="2 6"
                  />
                ))}

                {/* Edges */}
                {ENTITY_EDGES.map((edge) => {
                  const from = positions.get(edge.source);
                  const to = positions.get(edge.target);
                  if (!from || !to) return null;
                  const active =
                    edge.source === selectedId || edge.target === selectedId;
                  return (
                    <line
                      key={`${edge.source}-${edge.target}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={active ? "var(--accent)" : "var(--border-strong)"}
                      strokeWidth={active ? 1.5 : 1}
                      strokeOpacity={active ? 0.9 : 0.25 + edge.weight * 0.3}
                    />
                  );
                })}

                {/* Satellite nodes */}
                {satellites.map((node) => {
                  const pos = positions.get(node.id)!;
                  const r = 10 + (node.strength / 100) * 14;
                  const isSelected = node.id === selectedId;
                  const isConnected = connectedIds.has(node.id);
                  const color = TYPE_COLORS[node.type];
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedId(node.id)}
                      className="cursor-pointer"
                    >
                      {isSelected && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={r + 6}
                          fill="none"
                          stroke={color}
                          strokeOpacity={0.5}
                          strokeWidth={1.5}
                        />
                      )}
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r={r}
                        fill={color}
                        fillOpacity={isSelected ? 0.95 : isConnected ? 0.55 : 0.35}
                        stroke={color}
                        strokeWidth={isSelected ? 2 : 1}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                      <text
                        x={pos.x}
                        y={pos.y + r + 13}
                        textAnchor="middle"
                        className="select-none"
                        fill={isSelected ? "var(--foreground)" : "var(--muted)"}
                        fontSize={11}
                        fontWeight={isSelected ? 600 : 400}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}

                {/* Center node */}
                <g>
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={34}
                    fill="var(--accent)"
                    fillOpacity={0.18}
                  />
                  <circle cx={CENTER} cy={CENTER} r={24} fill="var(--accent)" />
                  <text
                    x={CENTER}
                    y={CENTER + 4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={10}
                    fontWeight={700}
                  >
                    Streamora
                  </text>
                </g>
              </svg>

              {/* Legend */}
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {(Object.keys(TYPE_LABELS) as EntityNode["type"][])
                  .filter((t) => t !== "brand")
                  .map((type) => (
                    <span
                      key={type}
                      className="flex items-center gap-1.5 text-[11px] text-muted"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ background: TYPE_COLORS[type] }}
                      />
                      {TYPE_LABELS[type]}
                    </span>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail + list */}
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selected.label}</CardTitle>
                <Badge
                  style={{
                    background: `${TYPE_COLORS[selected.type]}20`,
                    color: TYPE_COLORS[selected.type],
                  }}
                  className="border-transparent"
                >
                  {TYPE_LABELS[selected.type]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-strong">
                {selected.description}
              </p>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted">Association strength</span>
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    {selected.strength}/100
                    {selected.trend !== 0 && <Delta value={selected.trend} />}
                  </span>
                </div>
                <ProgressBar
                  value={selected.strength}
                  color={TYPE_COLORS[selected.type]}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All associations</CardTitle>
              <div className="mt-1 flex flex-wrap gap-1">
                {(["all", "feature", "category", "audience", "competitor", "source"] as const).map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={cn(
                        "rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors cursor-pointer",
                        typeFilter === t
                          ? "bg-accent-soft text-accent-strong"
                          : "text-muted hover:bg-surface-hover hover:text-foreground"
                      )}
                    >
                      {t === "all" ? "All" : TYPE_LABELS[t]}
                    </button>
                  )
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {listNodes.map((node) => (
                  <li key={node.id}>
                    <button
                      onClick={() => setSelectedId(node.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer",
                        node.id === selectedId
                          ? "bg-surface-hover"
                          : "hover:bg-surface-raised"
                      )}
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: TYPE_COLORS[node.type] }}
                      />
                      <span className="flex-1 truncate text-sm text-foreground">
                        {node.label}
                      </span>
                      <Delta value={node.trend} />
                      <span className="w-10 text-right text-xs font-semibold tabular-nums text-muted-strong">
                        {node.strength}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
