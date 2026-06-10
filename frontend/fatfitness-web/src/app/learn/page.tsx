import type { Metadata } from "next";
import { LearnOverviewView } from "@/app/_components/LearnOverviewView";

export const metadata: Metadata = {
  title: "Learn | Fat Fitness Community",
  description:
    "Beginner-friendly personal learning notes about food, training, and medical journey topics.",
};

export default function LearnPage() {
  return <LearnOverviewView />;
}
