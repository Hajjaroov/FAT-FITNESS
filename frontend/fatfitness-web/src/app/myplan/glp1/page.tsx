import type { Metadata } from "next";
import { MyPlanGlp1View } from "@/app/_components/MyPlanGlp1View";

export const metadata: Metadata = {
  title: "GLP-1 Log | My Plan | Fat Fitness",
  description: "A private log of your injections — date, dose, and an optional note.",
};

export default function MyPlanGlp1Page() {
  return <MyPlanGlp1View />;
}
