package com.fatfitness.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

import com.fatfitness.api.auth.repository.EmailVerificationTokenRepository;
import com.fatfitness.api.auth.model.EmailVerificationToken;
import com.fatfitness.api.auth.model.ClientType;
import com.fatfitness.api.auth.model.RefreshSession;
import com.fatfitness.api.auth.repository.RefreshSessionRepository;
import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.auth.service.PasswordHashingService;
import com.fatfitness.api.auth.service.SecureTokenService;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthRegistrationControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenRepository emailVerificationTokenRepository;

	@Autowired
	private RefreshSessionRepository refreshSessionRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	@Autowired
	private PasswordHashingService passwordHashingService;

	@Autowired
	private SecureTokenService secureTokenService;

	@Test
	void registerCreatesPendingUserAndReturnsDevVerificationToken() throws Exception {
		MvcResult result = mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "  New   Member  ",
								  "email": "NEW@example.COM",
								  "countryRegionCode": "de",
								  "password": "very-secret-password",
								  "confirmPassword": "very-secret-password",
								  "acceptedCommunityRules": true,
								  "acceptedPrivacyPolicy": true
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.userId", notNullValue()))
				.andExpect(jsonPath("$.email").value("new@example.com"))
				.andExpect(jsonPath("$.status").value("PENDING_EMAIL_VERIFICATION"))
				.andExpect(jsonPath("$.devEmailVerificationToken", notNullValue()))
				.andExpect(jsonPath("$.verificationExpiresAt", notNullValue()))
				.andReturn();

		UserAccount savedUser = userAccountRepository.findByEmail("new@example.com").orElseThrow();
		assertThat(savedUser.getDisplayName()).isEqualTo("New Member");
		assertThat(savedUser.getCountryRegionCode()).isEqualTo("DE");
		assertThat(savedUser.getStatus()).isEqualTo(UserStatus.PENDING_EMAIL_VERIFICATION);
		assertThat(passwordHashingService.matches("very-secret-password", savedUser.getPasswordHash())).isTrue();

		String rawToken = JsonPath.read(result.getResponse().getContentAsString(), "$.devEmailVerificationToken");
		String tokenHash = emailVerificationTokenService.hashToken(rawToken);

		assertThat(emailVerificationTokenRepository.findByTokenHash(tokenHash)).isPresent();
		assertThat(emailVerificationTokenRepository.findByTokenHash(rawToken)).isNotPresent();
	}

	@Test
	void registerRejectsDuplicateEmail() throws Exception {
		userAccountRepository.saveAndFlush(new UserAccount("taken@example.com", "Taken", "DE", "hash"));

		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "Another Member",
								  "email": "TAKEN@example.com",
								  "countryRegionCode": "DE",
								  "password": "very-secret-password",
								  "confirmPassword": "very-secret-password",
								  "acceptedCommunityRules": true,
								  "acceptedPrivacyPolicy": true
								}
								"""))
				.andExpect(status().isConflict());
	}

	@Test
	void registerRejectsPasswordConfirmationMismatch() throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "New Member",
								  "email": "new@example.com",
								  "countryRegionCode": "DE",
								  "password": "very-secret-password",
								  "confirmPassword": "different-password",
								  "acceptedCommunityRules": true,
								  "acceptedPrivacyPolicy": true
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void registerRequiresCommunityRulesAndPrivacyAgreement() throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "New Member",
								  "email": "new@example.com",
								  "countryRegionCode": "DE",
								  "password": "very-secret-password",
								  "confirmPassword": "very-secret-password",
								  "acceptedCommunityRules": false,
								  "acceptedPrivacyPolicy": false
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void verifyEmailActivatesUserAndConsumesToken() throws Exception {
		MvcResult registrationResult = registerNewMember("verify@example.com");
		String rawToken = JsonPath.read(
				registrationResult.getResponse().getContentAsString(),
				"$.devEmailVerificationToken");

		mockMvc.perform(post("/api/auth/verify-email")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s"
								}
								""".formatted(rawToken)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("verify@example.com"))
				.andExpect(jsonPath("$.status").value("ACTIVE"))
				.andExpect(jsonPath("$.emailVerifiedAt", notNullValue()));

		UserAccount savedUser = userAccountRepository.findByEmail("verify@example.com").orElseThrow();
		assertThat(savedUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
		assertThat(savedUser.getEmailVerifiedAt()).isNotNull();

		String tokenHash = emailVerificationTokenService.hashToken(rawToken);
		EmailVerificationToken token = emailVerificationTokenRepository.findByTokenHash(tokenHash).orElseThrow();
		assertThat(token.getConsumedAt()).isNotNull();
	}

	@Test
	void verifyEmailRejectsUnknownToken() throws Exception {
		mockMvc.perform(post("/api/auth/verify-email")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "unknown-token"
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void verifyEmailRejectsExpiredToken() throws Exception {
		String rawToken = "expired-token";
		UserAccount user = userAccountRepository.saveAndFlush(
				new UserAccount("expired@example.com", "Expired", "DE", "hash"));
		emailVerificationTokenRepository.saveAndFlush(new EmailVerificationToken(
				user,
				emailVerificationTokenService.hashToken(rawToken),
				Instant.now().minus(1, ChronoUnit.HOURS)));

		mockMvc.perform(post("/api/auth/verify-email")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s"
								}
								""".formatted(rawToken)))
				.andExpect(status().isBadRequest());

		UserAccount savedUser = userAccountRepository.findByEmail("expired@example.com").orElseThrow();
		assertThat(savedUser.getStatus()).isEqualTo(UserStatus.PENDING_EMAIL_VERIFICATION);
		assertThat(savedUser.getEmailVerifiedAt()).isNull();
	}

	@Test
	void verifyEmailRejectsConsumedToken() throws Exception {
		String rawToken = "consumed-token";
		UserAccount user = userAccountRepository.saveAndFlush(
				new UserAccount("consumed@example.com", "Consumed", "DE", "hash"));
		EmailVerificationToken token = new EmailVerificationToken(
				user,
				emailVerificationTokenService.hashToken(rawToken),
				Instant.now().plus(1, ChronoUnit.DAYS));
		token.markConsumed();
		emailVerificationTokenRepository.saveAndFlush(token);

		mockMvc.perform(post("/api/auth/verify-email")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s"
								}
								""".formatted(rawToken)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void resendVerificationCreatesNewDevTokenForPendingAccount() throws Exception {
		registerNewMember("resend@example.com");

		MvcResult result = mockMvc.perform(post("/api/auth/resend-verification")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "RESEND@example.com"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.devEmailVerificationToken", notNullValue()))
				.andExpect(jsonPath("$.verificationExpiresAt", notNullValue()))
				.andReturn();

		String rawToken = JsonPath.read(result.getResponse().getContentAsString(), "$.devEmailVerificationToken");
		String tokenHash = emailVerificationTokenService.hashToken(rawToken);

		assertThat(emailVerificationTokenRepository.findByTokenHash(tokenHash)).isPresent();
	}

	@Test
	void resendVerificationDoesNotCreateTokenForActiveAccount() throws Exception {
		UserAccount user = new UserAccount("active@example.com", "Active", "DE", "hash");
		user.verifyEmail();
		userAccountRepository.saveAndFlush(user);
		long tokenCount = emailVerificationTokenRepository.count();

		mockMvc.perform(post("/api/auth/resend-verification")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "active@example.com"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.devEmailVerificationToken").doesNotExist())
				.andExpect(jsonPath("$.verificationExpiresAt").doesNotExist());

		assertThat(emailVerificationTokenRepository.count()).isEqualTo(tokenCount);
	}

	@Test
	void resendVerificationDoesNotRevealUnknownEmail() throws Exception {
		long tokenCount = emailVerificationTokenRepository.count();

		mockMvc.perform(post("/api/auth/resend-verification")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "unknown@example.com"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.devEmailVerificationToken").doesNotExist())
				.andExpect(jsonPath("$.verificationExpiresAt").doesNotExist());

		assertThat(emailVerificationTokenRepository.count()).isEqualTo(tokenCount);
	}

	@Test
	void loginIssuesAccessTokenAndPersistsHashedRefreshSessionForActiveUser() throws Exception {
		registerAndVerifyMember("login@example.com");

		MvcResult result = mockMvc.perform(post("/api/auth/login")
						.header("User-Agent", "JUnit Browser")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "LOGIN@example.com",
								  "password": "very-secret-password",
								  "clientType": "WEB",
								  "deviceLabel": "Test browser"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("login@example.com"))
				.andExpect(jsonPath("$.displayName").value("New Member"))
				.andExpect(jsonPath("$.tokenType").value("Bearer"))
				.andExpect(jsonPath("$.accessToken", notNullValue()))
				.andExpect(jsonPath("$.accessTokenExpiresAt", notNullValue()))
				.andExpect(jsonPath("$.refreshToken", notNullValue()))
				.andExpect(jsonPath("$.refreshTokenExpiresAt", notNullValue()))
				.andReturn();

		String accessToken = JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
		String refreshToken = JsonPath.read(result.getResponse().getContentAsString(), "$.refreshToken");
		String refreshTokenHash = secureTokenService.hashToken(refreshToken);
		RefreshSession refreshSession = refreshSessionRepository.findByRefreshTokenHash(refreshTokenHash).orElseThrow();

		assertThat(accessToken).contains(".");
		assertThat(refreshSessionRepository.findByRefreshTokenHash(refreshToken)).isNotPresent();
		assertThat(refreshSession.getClientType()).isEqualTo(ClientType.WEB);
		assertThat(refreshSession.getDeviceLabel()).isEqualTo("Test browser");
		assertThat(refreshSession.getUserAgent()).isEqualTo("JUnit Browser");
		assertThat(refreshSession.getRevokedAt()).isNull();

		UserAccount savedUser = userAccountRepository.findByEmail("login@example.com").orElseThrow();
		assertThat(savedUser.getLastLoginAt()).isNotNull();
	}

	@Test
	void loginRejectsWrongPasswordWithoutRevealingAccountState() throws Exception {
		registerAndVerifyMember("wrong-password@example.com");

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "wrong-password@example.com",
								  "password": "wrong-password",
								  "clientType": "WEB",
								  "deviceLabel": "Test browser"
								}
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void loginRejectsPendingAccount() throws Exception {
		registerNewMember("pending-login@example.com");

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "pending-login@example.com",
								  "password": "very-secret-password",
								  "clientType": "WEB",
								  "deviceLabel": "Test browser"
								}
								"""))
				.andExpect(status().isForbidden());
	}

	@Test
	void loginRejectsUnknownEmailWithoutCreatingRefreshSession() throws Exception {
		long refreshSessionCount = refreshSessionRepository.count();

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "unknown-login@example.com",
								  "password": "very-secret-password",
								  "clientType": "WEB",
								  "deviceLabel": "Test browser"
								}
								"""))
				.andExpect(status().isUnauthorized());

		assertThat(refreshSessionRepository.count()).isEqualTo(refreshSessionCount);
	}

	@Test
	void refreshRotatesRefreshSessionAndIssuesNewTokens() throws Exception {
		MvcResult loginResult = loginActiveMember("refresh@example.com");
		String oldRefreshToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.refreshToken");
		RefreshSession oldSessionBeforeRefresh = refreshSessionRepository
				.findByRefreshTokenHash(secureTokenService.hashToken(oldRefreshToken))
				.orElseThrow();

		MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
						.header("User-Agent", "Refresh Browser")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "%s"
								}
								""".formatted(oldRefreshToken)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.tokenType").value("Bearer"))
				.andExpect(jsonPath("$.accessToken", notNullValue()))
				.andExpect(jsonPath("$.accessTokenExpiresAt", notNullValue()))
				.andExpect(jsonPath("$.refreshToken", notNullValue()))
				.andExpect(jsonPath("$.refreshTokenExpiresAt", notNullValue()))
				.andReturn();

		String newRefreshToken = JsonPath.read(refreshResult.getResponse().getContentAsString(), "$.refreshToken");
		assertThat(newRefreshToken).isNotEqualTo(oldRefreshToken);

		RefreshSession oldSession = refreshSessionRepository.findById(oldSessionBeforeRefresh.getId()).orElseThrow();
		RefreshSession newSession = refreshSessionRepository
				.findByRefreshTokenHash(secureTokenService.hashToken(newRefreshToken))
				.orElseThrow();

		assertThat(refreshSessionRepository.findByRefreshTokenHash(newRefreshToken)).isNotPresent();
		assertThat(oldSession.getRevokedAt()).isNotNull();
		assertThat(oldSession.getLastUsedAt()).isNotNull();
		assertThat(oldSession.getReplacedBySession().getId()).isEqualTo(newSession.getId());
		assertThat(newSession.getClientType()).isEqualTo(ClientType.WEB);
		assertThat(newSession.getDeviceLabel()).isEqualTo("Test browser");
		assertThat(newSession.getUserAgent()).isEqualTo("Refresh Browser");
		assertThat(newSession.getRevokedAt()).isNull();
	}

	@Test
	void refreshRejectsUnknownTokenWithoutCreatingSession() throws Exception {
		long refreshSessionCount = refreshSessionRepository.count();

		mockMvc.perform(post("/api/auth/refresh")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "unknown-refresh-token"
								}
								"""))
				.andExpect(status().isUnauthorized());

		assertThat(refreshSessionRepository.count()).isEqualTo(refreshSessionCount);
	}

	@Test
	void refreshRejectsRevokedToken() throws Exception {
		MvcResult loginResult = loginActiveMember("revoked-refresh@example.com");
		String oldRefreshToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.refreshToken");

		mockMvc.perform(post("/api/auth/refresh")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "%s"
								}
								""".formatted(oldRefreshToken)))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/auth/refresh")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "%s"
								}
								""".formatted(oldRefreshToken)))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void refreshRejectsExpiredTokenAndRevokesSession() throws Exception {
		String rawRefreshToken = "expired-refresh-token";
		UserAccount user = new UserAccount("expired-refresh@example.com", "Expired Refresh", "DE", "hash");
		user.verifyEmail();
		UserAccount savedUser = userAccountRepository.saveAndFlush(user);
		RefreshSession expiredSession = refreshSessionRepository.saveAndFlush(new RefreshSession(
				savedUser,
				secureTokenService.hashToken(rawRefreshToken),
				ClientType.WEB,
				Instant.now().minus(1, ChronoUnit.HOURS)));

		mockMvc.perform(post("/api/auth/refresh")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "%s"
								}
								""".formatted(rawRefreshToken)))
				.andExpect(status().isUnauthorized());

		RefreshSession savedExpiredSession = refreshSessionRepository.findById(expiredSession.getId()).orElseThrow();
		assertThat(savedExpiredSession.getRevokedAt()).isNotNull();
	}

	@Test
	void refreshRejectsBannedUserAndRevokesSession() throws Exception {
		MvcResult loginResult = loginActiveMember("banned-refresh@example.com");
		String refreshToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.refreshToken");
		UserAccount user = userAccountRepository.findByEmail("banned-refresh@example.com").orElseThrow();
		user.ban();
		userAccountRepository.saveAndFlush(user);

		mockMvc.perform(post("/api/auth/refresh")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "%s"
								}
								""".formatted(refreshToken)))
				.andExpect(status().isForbidden());

		RefreshSession refreshSession = refreshSessionRepository
				.findByRefreshTokenHash(secureTokenService.hashToken(refreshToken))
				.orElseThrow();
		assertThat(refreshSession.getRevokedAt()).isNotNull();
	}

	@Test
	void logoutRevokesRefreshSessionAndPreventsFutureRefresh() throws Exception {
		MvcResult loginResult = loginActiveMember("logout@example.com");
		String refreshToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.refreshToken");

		mockMvc.perform(post("/api/auth/logout")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "%s"
								}
								""".formatted(refreshToken)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value("Logged out if the session existed."));

		RefreshSession refreshSession = refreshSessionRepository
				.findByRefreshTokenHash(secureTokenService.hashToken(refreshToken))
				.orElseThrow();
		assertThat(refreshSession.getRevokedAt()).isNotNull();

		mockMvc.perform(post("/api/auth/refresh")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "%s"
								}
								""".formatted(refreshToken)))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void logoutIsIdempotentForAlreadyRevokedToken() throws Exception {
		MvcResult loginResult = loginActiveMember("logout-twice@example.com");
		String refreshToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.refreshToken");

		mockMvc.perform(post("/api/auth/logout")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "%s"
								}
								""".formatted(refreshToken)))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/auth/logout")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "%s"
								}
								""".formatted(refreshToken)))
				.andExpect(status().isOk());
	}

	@Test
	void logoutDoesNotRevealUnknownToken() throws Exception {
		long refreshSessionCount = refreshSessionRepository.count();

		mockMvc.perform(post("/api/auth/logout")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "unknown-refresh-token"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value("Logged out if the session existed."));

		assertThat(refreshSessionRepository.count()).isEqualTo(refreshSessionCount);
	}

	@Test
	void meReturnsCurrentUserForBearerToken() throws Exception {
		MvcResult loginResult = loginActiveMember("me@example.com");
		String accessToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.accessToken");

		mockMvc.perform(get("/api/auth/me")
						.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.userId", notNullValue()))
				.andExpect(jsonPath("$.email").value("me@example.com"))
				.andExpect(jsonPath("$.displayName").value("New Member"))
				.andExpect(jsonPath("$.countryRegionCode").value("DE"))
				.andExpect(jsonPath("$.status").value("ACTIVE"))
				.andExpect(jsonPath("$.roles[0]").value("USER"))
				.andExpect(jsonPath("$.emailVerifiedAt", notNullValue()))
				.andExpect(jsonPath("$.lastLoginAt", notNullValue()));
	}

	@Test
	void meRejectsMissingBearerToken() throws Exception {
		mockMvc.perform(get("/api/auth/me"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void meRejectsInvalidBearerToken() throws Exception {
		mockMvc.perform(get("/api/auth/me")
						.header("Authorization", "Bearer invalid-token"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void meRejectsBannedUserEvenWithValidToken() throws Exception {
		MvcResult loginResult = loginActiveMember("banned-me@example.com");
		String accessToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.accessToken");
		UserAccount user = userAccountRepository.findByEmail("banned-me@example.com").orElseThrow();
		user.ban();
		userAccountRepository.saveAndFlush(user);

		mockMvc.perform(get("/api/auth/me")
						.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isForbidden());
	}

	private MvcResult registerNewMember(String email) throws Exception {
		return mockMvc.perform(post("/api/auth/register")
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
				.andExpect(status().isCreated())
				.andReturn();
	}

	private void registerAndVerifyMember(String email) throws Exception {
		MvcResult registrationResult = registerNewMember(email);
		String rawToken = JsonPath.read(
				registrationResult.getResponse().getContentAsString(),
				"$.devEmailVerificationToken");

		mockMvc.perform(post("/api/auth/verify-email")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s"
								}
								""".formatted(rawToken)))
				.andExpect(status().isOk());
	}

	private MvcResult loginActiveMember(String email) throws Exception {
		registerAndVerifyMember(email);

		return mockMvc.perform(post("/api/auth/login")
						.header("User-Agent", "JUnit Browser")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "%s",
								  "password": "very-secret-password",
								  "clientType": "WEB",
								  "deviceLabel": "Test browser"
								}
								""".formatted(email)))
				.andExpect(status().isOk())
				.andReturn();
	}
}
