import type { Metadata } from "next";
import { HomeClient } from "@/components/home/home-client";

export const metadata: Metadata = {
  title: "Home",
  description:
    "BrandSignal — AI Visibility Intelligence. See if AI recommends your brand or your competitors.",
};

export default function HomePage() {
  return <HomeClient />;
}
