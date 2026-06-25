import type { Metadata } from "next";
import { LearnOverviewView } from "@/app/_components/LearnOverviewView";

export const metadata: Metadata = {
  title: "Journal | Fat Fitness Community",
  description:
    "Personal journal covering food & diet, training, and the medical journey — honest notes from the road.",
};

export default function JournalPage() {
  return <LearnOverviewView />;
}
