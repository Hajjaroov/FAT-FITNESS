package com.fatfitness.api.auth.dto;

import java.time.Instant;

public record RefreshResponse(
		String tokenType,
		String accessToken,
		Instant accessTokenExpiresAt,
		String refreshToken,
		Instant refreshTokenExpiresAt
) {
}
