package com.fatfitness.api.push.dto;

import jakarta.validation.constraints.NotBlank;

public record UnsubscribePushRequest(
		@NotBlank
		String endpoint
) {
}
