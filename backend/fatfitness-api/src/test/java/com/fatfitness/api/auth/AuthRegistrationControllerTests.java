package com.fatfitness.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.notNullValue;
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
import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.auth.service.PasswordHashingService;
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
	private EmailVerificationTokenService emailVerificationTokenService;

	@Autowired
	private PasswordHashingService passwordHashingService;

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
}
