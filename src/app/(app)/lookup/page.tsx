import type { Metadata } from "next";
import { LookupClient } from "./lookup-client";

export const metadata: Metadata = { title: "Brand lookup" };

export default async function LookupPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const params = await searchParams;
  return <LookupClient initialBrand={params.brand?.trim() ?? ""} />;
}
