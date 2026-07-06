import type { Metadata } from "next";
import { MyPlanDietView } from "@/app/_components/MyPlanDietView";

export const metadata: Metadata = {
  title: "Diet | My Plan | Fat Fitness",
  description: "Build your own meals from foods you add, and see the totals as you go.",
};

export default function MyPlanDietPage() {
  return <MyPlanDietView />;
}
