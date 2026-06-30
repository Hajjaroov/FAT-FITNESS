package com.fatfitness.api.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReplyMessageRequest(
		@NotBlank
		@Size(min = 1, max = 6000)
		String body
) {
}
