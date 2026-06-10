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
import com.fatfitness.api.auth.model.RefreshSession;
import com.fatfitness.api.auth.repository.EmailVerificationTokenRepository;
import com.fatfitness.api.auth.repository.RefreshSessionRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@Transactional
class AuthPersistenceTests {

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenRepository emailVerificationTokenRepository;

	@Autowired
	private RefreshSessionRepository refreshSessionRepository;

	@Test
	void persistsUserRolesVerificationTokenAndRefreshSession() {
		UserAccount user = new UserAccount("USER@Example.COM", "Journey Starter", "SA", "hashed-password");
		user.addRole(UserRole.MODERATOR);

		UserAccount savedUser = userAccountRepository.saveAndFlush(user);
		EmailVerificationToken verificationToken = emailVerificationTokenRepository.saveAndFlush(
				new EmailVerificationToken(savedUser, "verification-token-hash", Instant.now().plus(1, ChronoUnit.DAYS)));
		RefreshSession refreshSession = new RefreshSession(
				savedUser,
				"refresh-token-hash",
				ClientType.WEB,
				Instant.now().plus(30, ChronoUnit.DAYS));
		refreshSession.setClientMetadata("Chrome on Windows", "Mozilla", "127.0.0.1");
		RefreshSession savedRefreshSession = refreshSessionRepository.saveAndFlush(refreshSession);

		assertThat(savedUser.getId()).isNotNull();
		assertThat(savedUser.getEmail()).isEqualTo("user@example.com");
		assertThat(savedUser.getStatus()).isEqualTo(UserStatus.PENDING_EMAIL_VERIFICATION);
		assertThat(savedUser.getRoles()).containsExactlyInAnyOrder(UserRole.USER, UserRole.MODERATOR);
		assertThat(verificationToken.getId()).isNotNull();
		assertThat(savedRefreshSession.getId()).isNotNull();
		assertThat(refreshSessionRepository.findByRefreshTokenHash("refresh-token-hash")).isPresent();
	}
}
