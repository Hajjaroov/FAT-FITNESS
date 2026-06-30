export type MessageItem = {
  id: string;
  conversationId: string;
  senderId: string;
  senderDisplayName: string;
  senderHasAvatar: boolean;
  body: string;
  sentAt: string;
};

export type ConversationSummary = {
  conversationId: string;
  subject: string;
  otherParticipantId: string;
  otherParticipantDisplayName: string;
  otherParticipantHasAvatar: boolean;
  lastMessagePreview: string;
  lastMessageAt: string;
  unread: boolean;
};

export type ConversationThread = {
  conversationId: string;
  subject: string;
  otherParticipantId: string;
  otherParticipantDisplayName: string;
  otherParticipantHasAvatar: boolean;
  messages: MessageItem[];
};

export type UnreadCount = {
  count: number;
};

export type StartConversationRequest = {
  recipientId: string;
  subject: string;
  body: string;
};

export type ReplyMessageRequest = {
  body: string;
};

export type BroadcastMessageRequest = {
  subject: string;
  body: string;
};

export type BroadcastMessageResponse = {
  recipientCount: number;
};
