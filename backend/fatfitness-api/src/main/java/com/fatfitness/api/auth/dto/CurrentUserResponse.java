package com.fatfitness.api.auth.dto;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.entity.UserStatus;

public record CurrentUserResponse(
		UUID userId,
		String email,
		String displayName,
		String countryRegionCode,
		UserStatus status,
		Set<UserRole> roles,
		Instant emailVerifiedAt,
		Instant lastLoginAt,
		boolean hasAvatar
) {
}
