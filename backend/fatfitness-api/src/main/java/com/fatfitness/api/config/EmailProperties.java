package com.fatfitness.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "fatfitness.email")
public record EmailProperties(
		String resendApiKey,
		String from,
		String appBaseUrl
) {
}
