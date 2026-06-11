package com.fatfitness.api.config;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
public class JwtConfig {

	@Bean
	public JwtEncoder jwtEncoder(AuthProperties authProperties) {
		SecretKey secretKey = new SecretKeySpec(
				authProperties.jwt().secret().getBytes(StandardCharsets.UTF_8),
				"HmacSHA256");
		return new NimbusJwtEncoder(new ImmutableSecret<>(secretKey));
	}

	@Bean
	public JwtDecoder jwtDecoder(AuthProperties authProperties) {
		SecretKey secretKey = new SecretKeySpec(
				authProperties.jwt().secret().getBytes(StandardCharsets.UTF_8),
				"HmacSHA256");
		return NimbusJwtDecoder.withSecretKey(secretKey)
				.macAlgorithm(MacAlgorithm.HS256)
				.build();
	}
}
