import type { Metadata } from "next";
import { ScannerClient } from "./scanner-client";

export const metadata: Metadata = { title: "Scanner" };

export default function ScannerPage() {
  return <ScannerClient />;
}
