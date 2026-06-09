import type { Metadata } from "next";
import { MedicalJourneyView } from "@/app/_components/MedicalJourneyView";

export const metadata: Metadata = {
  title: "Medical Journey | Fat Fitness Community",
  description:
    "A personal GLP-1 and medical journey log documented carefully without medical advice.",
};

export default function MedicalJourneyPage() {
  return <MedicalJourneyView />;
}
