package com.fatfitness.api.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.auth.model.EmailVerificationToken;
import com.fatfitness.api.auth.repository.EmailVerificationTokenRepository;
import com.fatfitness.api.user.entity.UserAccount;

@Service
public class EmailVerificationTokenService {

	private static final int TOKEN_BYTE_LENGTH = 32;
	private static final Duration TOKEN_TTL = Duration.ofHours(24);

	private final SecureRandom secureRandom = new SecureRandom();
	private final EmailVerificationTokenRepository emailVerificationTokenRepository;

	public EmailVerificationTokenService(EmailVerificationTokenRepository emailVerificationTokenRepository) {
		this.emailVerificationTokenRepository = emailVerificationTokenRepository;
	}

	public CreatedEmailVerificationToken createFor(UserAccount user) {
		String rawToken = generateRawToken();
		String tokenHash = hashToken(rawToken);
		Instant expiresAt = Instant.now().plus(TOKEN_TTL);

		emailVerificationTokenRepository.save(new EmailVerificationToken(user, tokenHash, expiresAt));

		return new CreatedEmailVerificationToken(rawToken, expiresAt);
	}

	public UserAccount verify(String rawToken) {
		EmailVerificationToken token = emailVerificationTokenRepository.findByTokenHash(hashToken(rawToken))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification token"));

		if (token.getConsumedAt() != null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token has already been used");
		}

		if (!token.getExpiresAt().isAfter(Instant.now())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token has expired");
		}

		UserAccount user = token.getUser();
		user.verifyEmail();
		token.markConsumed();

		return user;
	}

	public String hashToken(String rawToken) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
			return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
		} catch (NoSuchAlgorithmException ex) {
			throw new IllegalStateException("SHA-256 hashing is not available", ex);
		}
	}

	private String generateRawToken() {
		byte[] bytes = new byte[TOKEN_BYTE_LENGTH];
		secureRandom.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	public record CreatedEmailVerificationToken(
			String rawToken,
			Instant expiresAt
	) {
	}
}
