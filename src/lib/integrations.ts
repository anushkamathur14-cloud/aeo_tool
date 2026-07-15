/** Stable extension contract for future monitoring and data-source integrations. */
export type IntegrationId = "slack" | "teams" | "gsc" | "ga4" | "ahrefs";

export interface IntegrationAdapter {
  id: IntegrationId;
  name: string;
  status: "planned" | "connected" | "error";
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export const plannedIntegrations: Pick<IntegrationAdapter, "id" | "name" | "status">[] = [
  { id: "slack", name: "Slack alerts", status: "planned" },
  { id: "teams", name: "Microsoft Teams", status: "planned" },
  { id: "gsc", name: "Google Search Console", status: "planned" },
  { id: "ga4", name: "Google Analytics 4", status: "planned" },
  { id: "ahrefs", name: "Ahrefs", status: "planned" },
];
