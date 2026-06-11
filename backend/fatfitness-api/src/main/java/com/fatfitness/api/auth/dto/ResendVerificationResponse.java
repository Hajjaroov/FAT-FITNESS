package com.fatfitness.api.auth.dto;

import java.time.Instant;

public record ResendVerificationResponse(
		String message,
		String devEmailVerificationToken,
		Instant verificationExpiresAt
) {
}
