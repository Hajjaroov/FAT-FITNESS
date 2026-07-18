package com.fatfitness.api.auth.service;

import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.repository.EmailVerificationTokenRepository;
import com.fatfitness.api.auth.repository.PasswordResetTokenRepository;
import com.fatfitness.api.auth.repository.RefreshSessionRepository;

/**
 * Purges expired auth credentials so their tables do not grow without bound:
 * refresh rotation inserts a new refresh_sessions row on every refresh and only
 * ever marks old ones revoked, and verification/reset tokens are never removed
 * after expiry. Rows are kept for a grace period past expiry for debugging.
 */
@Service
public class AuthCredentialCleanupService {

	private static final Logger log = LoggerFactory.getLogger(AuthCredentialCleanupService.class);

	private static final Duration RETENTION_AFTER_EXPIRY = Duration.ofDays(7);

	private final RefreshSessionRepository refreshSessionRepository;
	private final EmailVerificationTokenRepository emailVerificationTokenRepository;
	private final PasswordResetTokenRepository passwordResetTokenRepository;

	public AuthCredentialCleanupService(
			RefreshSessionRepository refreshSessionRepository,
			EmailVerificationTokenRepository emailVerificationTokenRepository,
			PasswordResetTokenRepository passwordResetTokenRepository) {
		this.refreshSessionRepository = refreshSessionRepository;
		this.emailVerificationTokenRepository = emailVerificationTokenRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
	}

	/** Runs every 6 hours; first run one minute after startup. */
	@Scheduled(fixedDelay = 21_600_000, initialDelay = 60_000)
	@Transactional
	public void purgeExpiredCredentials() {
		Instant cutoff = Instant.now().minus(RETENTION_AFTER_EXPIRY);

		refreshSessionRepository.detachReplacementReferencesForExpiredBefore(cutoff);
		int refreshSessions = refreshSessionRepository.deleteByExpiresAtBefore(cutoff);
		int verificationTokens = emailVerificationTokenRepository.deleteByExpiresAtBefore(cutoff);
		int resetTokens = passwordResetTokenRepository.deleteByExpiresAtBefore(cutoff);

		if (refreshSessions > 0 || verificationTokens > 0 || resetTokens > 0) {
			log.info("Purged expired auth credentials: {} refresh sessions, {} verification tokens, {} reset tokens",
					refreshSessions, verificationTokens, resetTokens);
		}
	}
}
