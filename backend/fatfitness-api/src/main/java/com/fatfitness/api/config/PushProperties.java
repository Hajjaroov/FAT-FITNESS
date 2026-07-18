package com.fatfitness.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties(prefix = "fatfitness.push")
public record PushProperties(
		@NotBlank
		String vapidPublicKey,

		@NotBlank
		String vapidPrivateKey,

		@NotBlank
		String vapidSubject
) {
}
