import type { Metadata } from "next";
import { MyPlanView } from "@/app/_components/MyPlanView";

export const metadata: Metadata = {
  title: "My Plan | Fat Fitness",
  description: "Your private personal tracking hub — weight, diet, workout, and medication logs.",
};

export default function MyPlanPage() {
  return <MyPlanView />;
}
