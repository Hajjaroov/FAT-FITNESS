package com.fatfitness.api.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BroadcastMessageRequest(
		@NotBlank
		@Size(min = 2, max = 160)
		String subject,

		@NotBlank
		@Size(min = 1, max = 6000)
		String body
) {
}
