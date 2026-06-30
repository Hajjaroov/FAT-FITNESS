package com.fatfitness.api.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BroadcastMessageRequest(
		@NotBlank
		@Size(min = 2, max = 160)
		String subject,

		@NotBlank
		@Size(min = 1, max = 6000)
		String body,

		@NotNull
		BroadcastChannel channel,

		// Only effective when the sender holds the OWNER role; ignored otherwise.
		// Boxed Boolean so omitting the field in JSON deserialization yields null (treated as false) instead of failing.
		Boolean bypassEmailPreference
) {
}
