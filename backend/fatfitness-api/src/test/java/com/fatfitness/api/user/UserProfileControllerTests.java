package com.fatfitness.api.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.model.RefreshSession;
import com.fatfitness.api.auth.repository.RefreshSessionRepository;
import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.auth.service.PasswordHashingService;
import com.fatfitness.api.auth.service.SecureTokenService;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserProfileControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private RefreshSessionRepository refreshSessionRepository;

	@Autowired
	private PasswordHashingService passwordHashingService;

	@Autowired
	private SecureTokenService secureTokenService;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	@Test
	void updateProfileRequiresAuthentication() throws Exception {
		mockMvc.perform(patch("/api/users/me/profile")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "Changed Name",
								  "countryRegionCode": "SA"
								}
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void updateProfileChangesDisplayNameAndCountry() throws Exception {
		String accessToken = registerVerifyAndLogin("profile-update@example.com");

		mockMvc.perform(patch("/api/users/me/profile")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "  Changed   Name  ",
								  "countryRegionCode": "sa"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.displayName").value("Changed Name"))
				.andExpect(jsonPath("$.countryRegionCode").value("SA"));

		UserAccount user = userAccountRepository.findByEmail("profile-update@example.com").orElseThrow();
		assertThat(user.getDisplayName()).isEqualTo("Changed Name");
		assertThat(user.getCountryRegionCode()).isEqualTo("SA");
	}

	@Test
	void updateProfileRejectsBlankDisplayName() throws Exception {
		String accessToken = registerVerifyAndLogin("profile-blank@example.com");

		mockMvc.perform(patch("/api/users/me/profile")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "   ",
								  "countryRegionCode": "DE"
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void changePasswordRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/users/me/change-password")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "currentPassword": "very-secret-password",
								  "newPassword": "another-secret-password",
								  "confirmPassword": "another-secret-password"
								}
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void changePasswordUpdatesHashAndRevokesSessions() throws Exception {
		MvcResult loginResult = registerVerifyAndLoginResult("change-password@example.com");
		String accessToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.accessToken");
		String refreshToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.refreshToken");

		mockMvc.perform(post("/api/users/me/change-password")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "currentPassword": "very-secret-password",
								  "newPassword": "another-secret-password",
								  "confirmPassword": "another-secret-password"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value("Password updated. You have been signed out of all devices."));

		UserAccount user = userAccountRepository.findByEmail("change-password@example.com").orElseThrow();
		assertThat(passwordHashingService.matches("another-secret-password", user.getPasswordHash())).isTrue();

		RefreshSession session = refreshSessionRepository
				.findByRefreshTokenHash(secureTokenService.hashToken(refreshToken)).orElseThrow();
		assertThat(session.getRevokedAt()).isNotNull();
	}

	@Test
	void changePasswordRejectsWrongCurrentPassword() throws Exception {
		String accessToken = registerVerifyAndLogin("change-wrong-current@example.com");

		mockMvc.perform(post("/api/users/me/change-password")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "currentPassword": "not-my-password",
								  "newPassword": "another-secret-password",
								  "confirmPassword": "another-secret-password"
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void changePasswordRejectsConfirmationMismatch() throws Exception {
		String accessToken = registerVerifyAndLogin("change-mismatch@example.com");

		mockMvc.perform(post("/api/users/me/change-password")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "currentPassword": "very-secret-password",
								  "newPassword": "another-secret-password",
								  "confirmPassword": "different-from-new"
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void changePasswordRejectsSameAsCurrentPassword() throws Exception {
		String accessToken = registerVerifyAndLogin("change-same@example.com");

		mockMvc.perform(post("/api/users/me/change-password")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "currentPassword": "very-secret-password",
								  "newPassword": "very-secret-password",
								  "confirmPassword": "very-secret-password"
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void revokeAllSessionsRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/users/me/sessions/revoke-all"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void revokeAllSessionsRevokesActiveRefreshSessions() throws Exception {
		MvcResult loginResult = registerVerifyAndLoginResult("revoke-sessions@example.com");
		String accessToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.accessToken");
		String refreshToken = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.refreshToken");

		mockMvc.perform(post("/api/users/me/sessions/revoke-all")
						.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value("All sessions have been signed out."));

		RefreshSession session = refreshSessionRepository
				.findByRefreshTokenHash(secureTokenService.hashToken(refreshToken)).orElseThrow();
		assertThat(session.getRevokedAt()).isNotNull();

		// The revoked refresh token can no longer be rotated.
		mockMvc.perform(post("/api/auth/refresh")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "refreshToken": "%s"
								}
								""".formatted(refreshToken)))
				.andExpect(status().isUnauthorized());
	}

	// --- helpers ---

	private String registerVerifyAndLogin(String email) throws Exception {
		return JsonPath.read(registerVerifyAndLoginResult(email).getResponse().getContentAsString(), "$.accessToken");
	}

	private MvcResult registerVerifyAndLoginResult(String email) throws Exception {
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

		return mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "%s",
								  "password": "very-secret-password",
								  "clientType": "MOBILE",
								  "deviceLabel": "Test client"
								}
								""".formatted(email)))
				.andExpect(status().isOk())
				.andReturn();
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
