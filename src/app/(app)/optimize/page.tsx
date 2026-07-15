import type { Metadata } from "next";
import { OptimizeClient } from "./optimize-client";

export const metadata: Metadata = { title: "Content Optimizer" };

export default function OptimizePage() {
  return <OptimizeClient />;
}
