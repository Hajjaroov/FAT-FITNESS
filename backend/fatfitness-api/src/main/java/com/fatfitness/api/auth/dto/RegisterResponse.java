package com.fatfitness.api.auth.dto;

import java.util.UUID;

import com.fatfitness.api.user.entity.UserStatus;

public record RegisterResponse(
		UUID userId,
		String email,
		UserStatus status,
		String message
) {
}
