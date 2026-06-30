package com.fatfitness.api.messaging.dto;

import java.util.List;
import java.util.UUID;

public record ConversationThreadResponse(
		UUID conversationId,
		String subject,
		UUID otherParticipantId,
		String otherParticipantDisplayName,
		boolean otherParticipantHasAvatar,
		List<MessageResponse> messages
) {
}
