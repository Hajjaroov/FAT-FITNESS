import type { Metadata } from "next";
import { CommunityView } from "@/app/_components/CommunityView";

export const metadata: Metadata = {
  title: "Community | Fat Fitness Community",
  description:
    "A planned forum-style peer-support community for realistic beginner-friendly fitness and weight-loss discussions.",
};

export default function CommunityPage() {
  return <CommunityView />;
}
