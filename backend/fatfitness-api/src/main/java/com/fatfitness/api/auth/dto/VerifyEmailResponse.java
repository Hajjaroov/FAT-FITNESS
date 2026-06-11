package com.fatfitness.api.auth.dto;

import java.time.Instant;
import java.util.UUID;

import com.fatfitness.api.user.entity.UserStatus;

public record VerifyEmailResponse(
		UUID userId,
		String email,
		UserStatus status,
		Instant emailVerifiedAt,
		String message
) {
}
