package com.fatfitness.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
		@NotBlank @Size(max = 2048)
		String token,

		@NotBlank @Size(min = 8, max = 128)
		String newPassword,

		@NotBlank @Size(max = 128)
		String confirmPassword
) {
}
