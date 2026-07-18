package com.fatfitness.api.push.dto;

import jakarta.validation.constraints.NotBlank;

public record SubscribePushRequest(
		@NotBlank
		String endpoint,

		@NotBlank
		String p256dh,

		@NotBlank
		String auth
) {
}
