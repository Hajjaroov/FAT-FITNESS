package com.fatfitness.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.model.ClientType;
import com.fatfitness.api.auth.model.EmailVerificationToken;
import com.fatfitness.api.auth.model.PasswordResetToken;
import com.fatfitness.api.auth.model.RefreshSession;
import com.fatfitness.api.auth.repository.EmailVerificationTokenRepository;
import com.fatfitness.api.auth.repository.PasswordResetTokenRepository;
import com.fatfitness.api.auth.repository.RefreshSessionRepository;
import com.fatfitness.api.auth.service.AuthCredentialCleanupService;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@Transactional
class AuthCredentialCleanupServiceTests {

	@Autowired
	private AuthCredentialCleanupService cleanupService;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private RefreshSessionRepository refreshSessionRepository;

	@Autowired
	private EmailVerificationTokenRepository emailVerificationTokenRepository;

	@Autowired
	private PasswordResetTokenRepository passwordResetTokenRepository;

	@Test
	void purgeRemovesLongExpiredRowsAndKeepsFreshOnes() {
		UserAccount user = userAccountRepository.save(new UserAccount(
				"cleanup-test@example.com", "Cleanup Tester", "DE", "irrelevant-hash"));

		Instant longExpired = Instant.now().minus(30, ChronoUnit.DAYS);
		Instant fresh = Instant.now().plus(30, ChronoUnit.DAYS);

		// A rotation chain of two long-expired sessions (old -> replacement) plus one live one.
		RefreshSession oldSession = refreshSessionRepository.save(
				new RefreshSession(user, "hash-old", ClientType.WEB, longExpired.minus(1, ChronoUnit.DAYS)));
		RefreshSession replacement = refreshSessionRepository.save(
				new RefreshSession(user, "hash-replacement", ClientType.WEB, longExpired));
		oldSession.replaceWith(replacement);
		refreshSessionRepository.save(oldSession);
		RefreshSession liveSession = refreshSessionRepository.save(
				new RefreshSession(user, "hash-live", ClientType.WEB, fresh));

		EmailVerificationToken expiredVerification = emailVerificationTokenRepository.save(
				new EmailVerificationToken(user, "verify-expired", longExpired));
		EmailVerificationToken freshVerification = emailVerificationTokenRepository.save(
				new EmailVerificationToken(user, "verify-fresh", fresh));

		PasswordResetToken expiredReset = passwordResetTokenRepository.save(
				new PasswordResetToken(user, "reset-expired", longExpired));
		PasswordResetToken freshReset = passwordResetTokenRepository.save(
				new PasswordResetToken(user, "reset-fresh", fresh));

		cleanupService.purgeExpiredCredentials();

		assertThat(refreshSessionRepository.findById(oldSession.getId())).isEmpty();
		assertThat(refreshSessionRepository.findById(replacement.getId())).isEmpty();
		assertThat(refreshSessionRepository.findById(liveSession.getId())).isPresent();

		assertThat(emailVerificationTokenRepository.findById(expiredVerification.getId())).isEmpty();
		assertThat(emailVerificationTokenRepository.findById(freshVerification.getId())).isPresent();

		assertThat(passwordResetTokenRepository.findById(expiredReset.getId())).isEmpty();
		assertThat(passwordResetTokenRepository.findById(freshReset.getId())).isPresent();
	}
}
