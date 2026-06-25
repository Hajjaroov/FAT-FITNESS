package com.fatfitness.api.user.dto;

public record UpdateProfileResponse(
		String displayName,
		String countryRegionCode
) {
}
