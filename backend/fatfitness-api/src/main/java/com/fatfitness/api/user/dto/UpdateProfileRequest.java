package com.fatfitness.api.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
		@NotBlank @Size(max = 80) String displayName,
		@NotBlank @Size(max = 16) String countryRegionCode
) {
}
