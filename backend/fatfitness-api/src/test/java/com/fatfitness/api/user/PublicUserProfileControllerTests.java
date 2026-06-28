package com.fatfitness.api.user;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PublicUserProfileControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	@Test
	void getProfileReturnsNotFoundForUnknownUser() throws Exception {
		mockMvc.perform(get("/api/users/{userId}/profile", UUID.randomUUID().toString()))
				.andExpect(status().isNotFound());
	}

	@Test
	void getProfileIsPublicAndReturnsActivityStats() throws Exception {
		String authorToken = registerVerifyAndLogin("public-profile-author@example.com");
		String likerToken = registerVerifyAndLogin("public-profile-liker@example.com");
		UUID authorId = userAccountRepository.findByEmail("public-profile-author@example.com").orElseThrow().getId();

		String postId = createPostAndReadId(authorToken, "introductions");
		createComment(authorToken, postId);
		// A second user likes the author's post so likesReceived is non-zero.
		mockMvc.perform(post("/api/community/posts/{postId}/like", postId)
				.header("Authorization", "Bearer " + likerToken))
				.andExpect(status().isOk());

		// No Authorization header — the endpoint must be public.
		mockMvc.perform(get("/api/users/{userId}/profile", authorId.toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.userId").value(authorId.toString()))
				.andExpect(jsonPath("$.displayName").value("Forum Member"))
				.andExpect(jsonPath("$.countryRegionCode").value("DE"))
				.andExpect(jsonPath("$.hasAvatar").value(false))
				.andExpect(jsonPath("$.joinedAt", notNullValue()))
				.andExpect(jsonPath("$.threadCount").value(1))
				.andExpect(jsonPath("$.commentCount").value(1))
				.andExpect(jsonPath("$.likesReceived").value(1))
				.andExpect(jsonPath("$.recentThreads", hasSize(1)))
				.andExpect(jsonPath("$.recentThreads[0].id").value(postId))
				.andExpect(jsonPath("$.recentComments", hasSize(1)));
	}

	@Test
	void getProfileReturnsNotFoundForDeletedUser() throws Exception {
		registerVerifyAndLogin("public-profile-deleted@example.com");
		UserAccount user = userAccountRepository.findByEmail("public-profile-deleted@example.com").orElseThrow();
		user.softDelete();
		userAccountRepository.saveAndFlush(user);

		mockMvc.perform(get("/api/users/{userId}/profile", user.getId().toString()))
				.andExpect(status().isNotFound());
	}

	@Test
	void getProfileReturnsBannedPlaceholderWithZeroActivity() throws Exception {
		String authorToken = registerVerifyAndLogin("public-profile-banned@example.com");
		UserAccount user = userAccountRepository.findByEmail("public-profile-banned@example.com").orElseThrow();
		createPostAndReadId(authorToken, "introductions");
		user.ban();
		userAccountRepository.saveAndFlush(user);

		mockMvc.perform(get("/api/users/{userId}/profile", user.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.displayName").value("Banned account"))
				.andExpect(jsonPath("$.countryRegionCode").value(org.hamcrest.Matchers.nullValue()))
				.andExpect(jsonPath("$.threadCount").value(0))
				.andExpect(jsonPath("$.commentCount").value(0))
				.andExpect(jsonPath("$.likesReceived").value(0))
				.andExpect(jsonPath("$.recentThreads", hasSize(0)))
				.andExpect(jsonPath("$.recentComments", hasSize(0)));
	}

	@Test
	void getProfileShowsModeratorBadgeButNeverUserRole() throws Exception {
		registerVerifyAndLogin("public-profile-mod@example.com");
		UserAccount user = userAccountRepository.findByEmail("public-profile-mod@example.com").orElseThrow();
		user.addRole(UserRole.MODERATOR);
		userAccountRepository.saveAndFlush(user);

		mockMvc.perform(get("/api/users/{userId}/profile", user.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.publicRoles", contains("MODERATOR")));
	}

	// --- helpers ---

	private String createPostAndReadId(String accessToken, String categorySlug) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/community/posts")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "categorySlug": "%s",
								  "title": "Starting here",
								  "body": "This is a longer first post body for the community.",
								  "acceptedCommunityGuidelines": true
								}
								""".formatted(categorySlug)))
				.andExpect(status().isCreated())
				.andReturn();
		return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
	}

	private void createComment(String accessToken, String postId) throws Exception {
		mockMvc.perform(post("/api/community/posts/{postId}/comments", postId)
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "body": "A first reply on this thread.",
								  "acceptedCommunityGuidelines": true
								}
								"""))
				.andExpect(status().isCreated());
	}

	private String registerVerifyAndLogin(String email) throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "Forum Member",
								  "email": "%s",
								  "countryRegionCode": "DE",
								  "password": "very-secret-password",
								  "confirmPassword": "very-secret-password",
								  "acceptedCommunityRules": true,
								  "acceptedPrivacyPolicy": true
								}
								""".formatted(email)))
				.andExpect(status().isCreated());

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

		MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
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
		return JsonPath.read(loginResult.getResponse().getContentAsString(), "$.accessToken");
	}
}
