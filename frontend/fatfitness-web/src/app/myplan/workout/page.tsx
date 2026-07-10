import type { Metadata } from "next";
import { MyPlanWorkoutView } from "@/app/_components/MyPlanWorkoutView";

export const metadata: Metadata = {
  title: "Workout | My Plan | Fat Fitness",
  description:
    "Build your weekly training plan, pick exercises from the library, and mark sessions as done.",
};

export default function MyPlanWorkoutPage() {
  return <MyPlanWorkoutView />;
}
