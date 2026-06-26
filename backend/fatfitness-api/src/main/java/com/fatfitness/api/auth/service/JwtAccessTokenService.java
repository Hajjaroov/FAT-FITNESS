package com.fatfitness.api.auth.service;

import java.time.Duration;
import java.time.Instant;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.fatfitness.api.config.AuthProperties;
import com.fatfitness.api.user.entity.UserAccount;

@Service
public class JwtAccessTokenService {

	private final JwtEncoder jwtEncoder;
	private final String issuer;
	private final Duration accessTokenTtl;

	public JwtAccessTokenService(
			JwtEncoder jwtEncoder,
			AuthProperties authProperties) {
		this.jwtEncoder = jwtEncoder;
		this.issuer = authProperties.jwt().issuer();
		this.accessTokenTtl = authProperties.jwt().accessTokenTtl();
	}

	public CreatedAccessToken createFor(UserAccount user) {
		Instant issuedAt = Instant.now();
		Instant expiresAt = issuedAt.plus(accessTokenTtl);

		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer(issuer)
				.issuedAt(issuedAt)
				.expiresAt(expiresAt)
				.subject(user.getId().toString())
				.claim("email", user.getEmail())
				.claim("roles", user.getRoles().stream().map(role -> role.name()).sorted().toList())
				.build();
		JwsHeader headers = JwsHeader.with(MacAlgorithm.HS256).build();

		String token = jwtEncoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();

		return new CreatedAccessToken(token, expiresAt);
	}

	public record CreatedAccessToken(
			String token,
			Instant expiresAt
	) {
	}
}
