import type { Metadata } from "next";
import { MyPlanWeightEntriesView } from "@/app/_components/MyPlanWeightEntriesView";

export const metadata: Metadata = {
  title: "Weight Entries | My Plan | Fat Fitness",
  description: "Every logged weigh-in in one place — add, edit, or delete any entry.",
};

export default function MyPlanWeightEntriesPage() {
  return <MyPlanWeightEntriesView />;
}
