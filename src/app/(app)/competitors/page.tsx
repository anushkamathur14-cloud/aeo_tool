import type { Metadata } from "next";
import { CompetitorsClient } from "./competitors-client";

export const metadata: Metadata = { title: "Competitors" };

export default function CompetitorsPage() {
  return <CompetitorsClient />;
}
