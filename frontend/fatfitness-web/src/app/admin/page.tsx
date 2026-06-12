import type { Metadata } from "next";
import { AdminModerationView } from "@/app/_components/AdminModerationView";

export const metadata: Metadata = {
  title: "Admin moderation | Fat Fitness Community",
  description:
    "Moderation report dashboard for the Fat Fitness Community forum.",
};

export default function AdminPage() {
  return <AdminModerationView />;
}
