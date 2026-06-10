import type { Metadata } from "next";
import { TrainingView } from "@/app/_components/TrainingView";

export const metadata: Metadata = {
  title: "Training | Fat Fitness Community",
  description:
    "Personal training notes from a beginner-friendly workout routine at a high starting weight.",
};

export default function TrainingPage() {
  return <TrainingView />;
}
