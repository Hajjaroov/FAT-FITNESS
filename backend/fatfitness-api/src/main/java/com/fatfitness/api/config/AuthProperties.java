package com.fatfitness.api.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Validated
@ConfigurationProperties(prefix = "fatfitness.auth")
public record AuthProperties(
		@Valid
		@NotNull
		Jwt jwt,

		@NotNull
		Duration refreshTokenTtl,

		@Valid
		@NotNull
		RefreshCookie refreshCookie
) {

	public record Jwt(
			@NotBlank
			String issuer,

			@NotBlank
			@Size(min = 32)
			String secret,

			@NotNull
			Duration accessTokenTtl
	) {
	}

	public record RefreshCookie(
			@NotBlank
			String name,

			@NotBlank
			String path,

			boolean secure,

			@NotBlank
			String sameSite
	) {
	}
}
