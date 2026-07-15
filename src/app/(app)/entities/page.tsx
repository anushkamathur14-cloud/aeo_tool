import type { Metadata } from "next";
import { EntitiesClient } from "./entities-client";

export const metadata: Metadata = { title: "Entity Graph" };

export default function EntitiesPage() {
  return <EntitiesClient />;
}
