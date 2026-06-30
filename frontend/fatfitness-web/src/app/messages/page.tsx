import type { Metadata } from "next";
import { MessagesInboxView } from "@/app/_components/MessagesInboxView";

export const metadata: Metadata = {
  title: "Messages | Fat Fitness",
};

export default function MessagesPage() {
  return <MessagesInboxView />;
}
