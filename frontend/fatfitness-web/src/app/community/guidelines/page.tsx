import type { Metadata } from "next";
import { CommunityGuidelinesView } from "@/app/_components/CommunityGuidelinesView";

export const metadata: Metadata = {
  title: "Community Guidelines | Fat Fitness Community",
  description:
    "Community guidelines for the planned Fat Fitness forum-style peer-support space.",
};

export default function CommunityGuidelinesPage() {
  return <CommunityGuidelinesView />;
}
