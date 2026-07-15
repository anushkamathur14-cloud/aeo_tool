import type { Metadata } from "next";
import { OpportunitiesClient } from "./opportunities-client";

export const metadata: Metadata = { title: "Opportunities" };

export default function OpportunitiesPage() {
  return <OpportunitiesClient />;
}
