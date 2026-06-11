package com.fatfitness.api.auth.dto;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import com.fatfitness.api.user.entity.UserRole;

public record LoginResponse(
		UUID userId,
		String email,
		String displayName,
		Set<UserRole> roles,
		String tokenType,
		String accessToken,
		Instant accessTokenExpiresAt,
		String refreshToken,
		Instant refreshTokenExpiresAt
) {
}
