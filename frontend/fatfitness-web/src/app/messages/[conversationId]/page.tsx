import type { Metadata } from "next";
import { ConversationThreadView } from "@/app/_components/ConversationThreadView";

type Props = {
  params: Promise<{ conversationId: string }>;
};

export const metadata: Metadata = {
  title: "Conversation | Fat Fitness",
};

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  return <ConversationThreadView conversationId={conversationId} />;
}
