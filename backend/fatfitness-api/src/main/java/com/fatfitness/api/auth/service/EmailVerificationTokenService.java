package com.fatfitness.api.auth.service;

import java.time.Duration;
import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.auth.model.EmailVerificationToken;
import com.fatfitness.api.auth.repository.EmailVerificationTokenRepository;
import com.fatfitness.api.user.entity.UserAccount;

@Service
public class EmailVerificationTokenService {

	private static final Duration TOKEN_TTL = Duration.ofHours(24);

	private final EmailVerificationTokenRepository emailVerificationTokenRepository;
	private final SecureTokenService secureTokenService;

	public EmailVerificationTokenService(
			EmailVerificationTokenRepository emailVerificationTokenRepository,
			SecureTokenService secureTokenService) {
		this.emailVerificationTokenRepository = emailVerificationTokenRepository;
		this.secureTokenService = secureTokenService;
	}

	public CreatedEmailVerificationToken createFor(UserAccount user) {
		String rawToken = secureTokenService.generateToken();
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
		return secureTokenService.hashToken(rawToken);
	}

	public record CreatedEmailVerificationToken(
			String rawToken,
			Instant expiresAt
	) {
	}
}
