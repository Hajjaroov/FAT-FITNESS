package com.fatfitness.api.messaging.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StartConversationRequest(
		@NotNull
		UUID recipientId,

		@NotBlank
		@Size(min = 2, max = 160)
		String subject,

		@NotBlank
		@Size(min = 1, max = 6000)
		String body
) {
}
