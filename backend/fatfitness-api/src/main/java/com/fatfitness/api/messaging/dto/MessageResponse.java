package com.fatfitness.api.messaging.dto;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
		UUID id,
		UUID conversationId,
		UUID senderId,
		String senderDisplayName,
		boolean senderHasAvatar,
		String body,
		Instant sentAt
) {
}
