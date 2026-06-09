import type { Metadata } from "next";
import { FoodAndDietView } from "@/app/_components/FoodAndDietView";

export const metadata: Metadata = {
  title: "Food & Diet | Fat Fitness Community",
  description:
    "A personal food and diet overview based on one beginner-friendly weight-loss journey.",
};

export default function FoodAndDietPage() {
  return <FoodAndDietView />;
}
