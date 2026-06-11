package com.fatfitness.api.auth.dto;

import com.fatfitness.api.auth.model.ClientType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LoginRequest(
		@NotBlank
		@Email
		@Size(max = 320)
		String email,

		@NotBlank
		@Size(max = 128)
		String password,

		@NotNull
		ClientType clientType,

		@Size(max = 120)
		String deviceLabel
) {
}
