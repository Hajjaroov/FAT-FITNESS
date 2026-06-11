package com.fatfitness.api.auth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
		@NotBlank
		@Size(min = 2, max = 80)
		String displayName,

		@NotBlank
		@Email
		@Size(max = 320)
		String email,

		@NotBlank
		@Size(max = 16)
		String countryRegionCode,

		@NotBlank
		@Size(min = 8, max = 128)
		String password,

		@NotBlank
		@Size(min = 8, max = 128)
		String confirmPassword,

		@AssertTrue
		boolean acceptedCommunityRules,

		@AssertTrue
		boolean acceptedPrivacyPolicy
) {
}
