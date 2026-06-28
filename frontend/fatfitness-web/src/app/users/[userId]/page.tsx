import type { Metadata } from "next";
import { UserProfileView } from "@/app/_components/UserProfileView";

type Props = {
  params: Promise<{ userId: string }>;
};

export const metadata: Metadata = {
  title: "User Profile | Fat Fitness",
};

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params;
  return <UserProfileView userId={userId} />;
}
