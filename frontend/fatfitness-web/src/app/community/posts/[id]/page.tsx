import type { Metadata } from "next";
import { CommunityPostDetailView } from "@/app/_components/CommunityPostDetailView";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Community post | Fat Fitness Community",
  description:
    "A forum post in the Fat Fitness Community peer-support forum.",
};

export default async function CommunityPostPage({ params }: PageProps) {
  const { id } = await params;

  return <CommunityPostDetailView postId={id} />;
}
