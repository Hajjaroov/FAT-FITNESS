import type { Metadata } from "next";
import { HomePageView } from "@/app/_components/HomePageView";

export const metadata: Metadata = {
  title: "Fat Fitness Community",
  description:
    "A personal weight-loss journey and future peer-support community built around realistic beginner-friendly support.",
};

export default function Home() {
  return <HomePageView />;
}
