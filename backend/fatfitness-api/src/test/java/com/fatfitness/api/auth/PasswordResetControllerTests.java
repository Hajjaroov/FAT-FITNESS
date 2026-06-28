package com.fatfitness.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.model.PasswordResetToken;
import com.fatfitness.api.auth.model.RefreshSession;
import com.fatfitness.api.auth.repository.PasswordResetTokenRepository;
import com.fatfitness.api.auth.repository.RefreshSessionRepository;
import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.auth.service.SecureTokenService;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PasswordResetControllerTests {

	private static final String SAFE_RESPONSE =
			"If an active account exists for this email, a password reset link has been sent.";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private PasswordResetTokenRepository passwordResetTokenRepository;

	@Autowired
	private RefreshSessionRepository refreshSessionRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	@Autowired
	private SecureTokenService secureTokenService;

	@Test
	void forgotPasswordReturnsSafeResponseAndCreatesTokenForActiveAccount() throws Exception {
		registerAndVerify("forgot-active@example.com");
		long tokensBefore = passwordResetTokenRepository.count();

		forgotPassword("FORGOT-ACTIVE@example.com")
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value(SAFE_RESPONSE));

		assertThat(passwordResetTokenRepository.count()).isGreaterThan(tokensBefore);
	}

	@Test
	void forgotPasswordReturnsSafeResponseWithoutTokenForUnknownEmail() throws Exception {
		long tokensBefore = passwordResetTokenRepository.count();

		forgotPassword("nobody@example.com")
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value(SAFE_RESPONSE));

		assertThat(passwordResetTokenRepository.count()).isEqualTo(tokensBefore);
	}

	@Test
	void forgotPasswordDoesNotCreateTokenForPendingAccount() throws Exception {
		registerNewMember("forgot-pending@example.com");
		long tokensBefore = passwordResetTokenRepository.count();

		forgotPassword("forgot-pending@example.com")
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value(SAFE_RESPONSE));

		assertThat(passwordResetTokenRepository.count()).isEqualTo(tokensBefore);
	}

	@Test
	void resetPasswordWithValidTokenUpdatesPasswordAndRevokesSessions() throws Exception {
		registerAndVerify("reset-valid@example.com");
		UserAccount user = userAccountRepository.findByEmail("reset-valid@example.com").orElseThrow();

		// A live refresh session that must be revoked after a successful reset.
		MvcResult loginResult = login("reset-valid@example.com", "very-secret-password");
		String refreshToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.refreshToken");

		String rawToken = createResetToken(user, Instant.now().plus(30, ChronoUnit.MINUTES));

		mockMvc.perform(post("/api/auth/reset-password")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s",
								  "newPassword": "brand-new-password",
								  "confirmPassword": "brand-new-password"
								}
								""".formatted(rawToken)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value("Password updated. Please sign in with your new password."));

		PasswordResetToken usedToken = passwordResetTokenRepository
				.findByTokenHash(secureTokenService.hashToken(rawToken)).orElseThrow();
		assertThat(usedToken.getUsedAt()).isNotNull();

		RefreshSession session = refreshSessionRepository
				.findByRefreshTokenHash(secureTokenService.hashToken(refreshToken)).orElseThrow();
		assertThat(session.getRevokedAt()).isNotNull();

		// New password works, old password no longer does.
		login("reset-valid@example.com", "brand-new-password").getResponse();
		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "reset-valid@example.com",
								  "password": "very-secret-password",
								  "clientType": "MOBILE",
								  "deviceLabel": "Test client"
								}
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void resetPasswordRejectsUnknownToken() throws Exception {
		mockMvc.perform(post("/api/auth/reset-password")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "unknown-reset-token",
								  "newPassword": "brand-new-password",
								  "confirmPassword": "brand-new-password"
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void resetPasswordRejectsExpiredToken() throws Exception {
		registerAndVerify("reset-expired@example.com");
		UserAccount user = userAccountRepository.findByEmail("reset-expired@example.com").orElseThrow();
		String rawToken = createResetToken(user, Instant.now().minus(1, ChronoUnit.MINUTES));

		mockMvc.perform(post("/api/auth/reset-password")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s",
								  "newPassword": "brand-new-password",
								  "confirmPassword": "brand-new-password"
								}
								""".formatted(rawToken)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void resetPasswordRejectsAlreadyUsedToken() throws Exception {
		registerAndVerify("reset-used@example.com");
		UserAccount user = userAccountRepository.findByEmail("reset-used@example.com").orElseThrow();
		String rawToken = createResetToken(user, Instant.now().plus(30, ChronoUnit.MINUTES));
		PasswordResetToken token = passwordResetTokenRepository
				.findByTokenHash(secureTokenService.hashToken(rawToken)).orElseThrow();
		token.markUsed();
		passwordResetTokenRepository.saveAndFlush(token);

		mockMvc.perform(post("/api/auth/reset-password")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s",
								  "newPassword": "brand-new-password",
								  "confirmPassword": "brand-new-password"
								}
								""".formatted(rawToken)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void resetPasswordRejectsConfirmationMismatch() throws Exception {
		registerAndVerify("reset-mismatch@example.com");
		UserAccount user = userAccountRepository.findByEmail("reset-mismatch@example.com").orElseThrow();
		String rawToken = createResetToken(user, Instant.now().plus(30, ChronoUnit.MINUTES));

		mockMvc.perform(post("/api/auth/reset-password")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s",
								  "newPassword": "brand-new-password",
								  "confirmPassword": "a-different-password"
								}
								""".formatted(rawToken)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void resetPasswordRejectsNonActiveAccount() throws Exception {
		registerAndVerify("reset-banned@example.com");
		UserAccount user = userAccountRepository.findByEmail("reset-banned@example.com").orElseThrow();
		String rawToken = createResetToken(user, Instant.now().plus(30, ChronoUnit.MINUTES));
		user.ban();
		userAccountRepository.saveAndFlush(user);

		mockMvc.perform(post("/api/auth/reset-password")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s",
								  "newPassword": "brand-new-password",
								  "confirmPassword": "brand-new-password"
								}
								""".formatted(rawToken)))
				.andExpect(status().isForbidden());
	}

	// --- helpers ---

	private String createResetToken(UserAccount user, Instant expiresAt) {
		String rawToken = secureTokenService.generateToken();
		passwordResetTokenRepository.saveAndFlush(
				new PasswordResetToken(user, secureTokenService.hashToken(rawToken), expiresAt));
		return rawToken;
	}

	private org.springframework.test.web.servlet.ResultActions forgotPassword(String email) throws Exception {
		return mockMvc.perform(post("/api/auth/forgot-password")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "email": "%s"
						}
						""".formatted(email)));
	}

	private MvcResult login(String email, String password) throws Exception {
		return mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "%s",
								  "password": "%s",
								  "clientType": "MOBILE",
								  "deviceLabel": "Test client"
								}
								""".formatted(email, password)))
				.andExpect(status().isOk())
				.andReturn();
	}

	private void registerAndVerify(String email) throws Exception {
		registerNewMember(email);
		UserAccount user = userAccountRepository.findByEmail(email.toLowerCase()).orElseThrow();
		var created = emailVerificationTokenService.createFor(user);

		mockMvc.perform(post("/api/auth/verify-email")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s"
								}
								""".formatted(created.rawToken())))
				.andExpect(status().isOk());
	}

	private void registerNewMember(String email) throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "New Member",
								  "email": "%s",
								  "countryRegionCode": "DE",
								  "password": "very-secret-password",
								  "confirmPassword": "very-secret-password",
								  "acceptedCommunityRules": true,
								  "acceptedPrivacyPolicy": true
								}
								""".formatted(email)))
				.andExpect(status().isCreated());
	}
}
