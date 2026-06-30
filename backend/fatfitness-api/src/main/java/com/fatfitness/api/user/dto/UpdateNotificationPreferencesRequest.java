package com.fatfitness.api.user.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationPreferencesRequest(
		@NotNull
		Boolean emailNotificationsPm
) {
}
