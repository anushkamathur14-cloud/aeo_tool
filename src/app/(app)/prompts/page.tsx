import type { Metadata } from "next";
import { PromptsClient } from "./prompts-client";

export const metadata: Metadata = { title: "Prompts" };

export default function PromptsPage() {
  return <PromptsClient />;
}
