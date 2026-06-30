package com.fatfitness.api.messaging.dto;

import java.time.Instant;
import java.util.UUID;

public record ConversationSummaryResponse(
		UUID conversationId,
		String subject,
		UUID otherParticipantId,
		String otherParticipantDisplayName,
		boolean otherParticipantHasAvatar,
		String lastMessagePreview,
		Instant lastMessageAt,
		boolean unread
) {
}
