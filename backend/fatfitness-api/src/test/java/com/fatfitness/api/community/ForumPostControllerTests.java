package com.fatfitness.api.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.community.repository.ForumPostReportRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ForumPostControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ForumPostReportRepository forumPostReportRepository;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	@Test
	void listPostsStartsEmpty() throws Exception {
		mockMvc.perform(get("/api/community/posts"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void createPostRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/community/posts")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "categorySlug": "introductions",
								  "title": "Starting here",
								  "body": "This is a longer first post body for the community.",
								  "acceptedCommunityGuidelines": true
								}
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void createPostPersistsPublishedPostAndPublicReadsReturnIt() throws Exception {
		String accessToken = registerVerifyAndLogin("writer@example.com");

		MvcResult createResult = createPost(accessToken, "introductions")
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id", notNullValue()))
				.andExpect(jsonPath("$.categorySlug").value("introductions"))
				.andExpect(jsonPath("$.categoryName").value("Introductions"))
				.andExpect(jsonPath("$.title").value("Starting here"))
				.andExpect(jsonPath("$.body").value("This is a longer first post body for the community."))
				.andExpect(jsonPath("$.authorDisplayName").value("Forum Member"))
				.andExpect(jsonPath("$.status").value("PUBLISHED"))
				.andExpect(jsonPath("$.locked").value(false))
				.andExpect(jsonPath("$.createdAt", notNullValue()))
				.andExpect(jsonPath("$.updatedAt", notNullValue()))
				.andReturn();
		String postId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

		mockMvc.perform(get("/api/community/posts")
						.param("categorySlug", "introductions"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].id").value(postId))
				.andExpect(jsonPath("$[0].title").value("Starting here"));

		mockMvc.perform(get("/api/community/posts/{postId}", postId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(postId))
				.andExpect(jsonPath("$.authorDisplayName").value("Forum Member"));
	}

	@Test
	void createPostRejectsUnknownCategory() throws Exception {
		String accessToken = registerVerifyAndLogin("unknown-category@example.com");

		mockMvc.perform(post("/api/community/posts")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "categorySlug": "not-a-board",
								  "title": "Starting here",
								  "body": "This is a longer first post body for the community.",
								  "acceptedCommunityGuidelines": true
								}
								"""))
				.andExpect(status().isNotFound());
	}

	@Test
	void createPostRequiresGuidelinesAcceptance() throws Exception {
		String accessToken = registerVerifyAndLogin("guidelines@example.com");

		mockMvc.perform(post("/api/community/posts")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "categorySlug": "introductions",
								  "title": "Starting here",
								  "body": "This is a longer first post body for the community.",
								  "acceptedCommunityGuidelines": false
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void createPostRejectsAccountThatBecameInactiveAfterTokenIssued() throws Exception {
		registerNewMember("pending-poster@example.com");
		String accessToken = loginActiveMemberByRepositoryBypass("pending-poster@example.com");

		mockMvc.perform(post("/api/community/posts")
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "categorySlug": "introductions",
								  "title": "Starting here",
								  "body": "This is a longer first post body for the community.",
								  "acceptedCommunityGuidelines": true
								}
								"""))
				.andExpect(status().isForbidden());
	}

	@Test
	void publicPostReadUsesBannedAuthorDisplayName() throws Exception {
		String accessToken = registerVerifyAndLogin("display-name@example.com");
		MvcResult createResult = createPost(accessToken, "introductions").andExpect(status().isCreated()).andReturn();
		String postId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");
		UserAccount author = userAccountRepository.findByEmail("display-name@example.com").orElseThrow();
		author.ban();
		userAccountRepository.saveAndFlush(author);

		mockMvc.perform(get("/api/community/posts/{postId}", postId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.authorDisplayName").value("Banned account"));
	}

	@Test
	void reportPostRequiresAuthentication() throws Exception {
		String accessToken = registerVerifyAndLogin("post-owner@example.com");
		MvcResult createResult = createPost(accessToken, "introductions").andExpect(status().isCreated()).andReturn();
		String postId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

		mockMvc.perform(post("/api/community/posts/{postId}/reports", postId)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "reason": "medical_misinformation",
								  "details": "This needs a moderator look."
								}
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void reportPostCreatesOpenReportAndIsIdempotentForSameReporter() throws Exception {
		String authorAccessToken = registerVerifyAndLogin("reported-post-owner@example.com");
		String reporterAccessToken = registerVerifyAndLogin("reporter@example.com");
		MvcResult createResult = createPost(authorAccessToken, "questions-and-support")
				.andExpect(status().isCreated())
				.andReturn();
		String postId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

		MvcResult reportResult = reportPost(reporterAccessToken, postId)
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id", notNullValue()))
				.andExpect(jsonPath("$.postId").value(postId))
				.andExpect(jsonPath("$.reason").value("medical_misinformation"))
				.andExpect(jsonPath("$.details").value("This needs a moderator look."))
				.andExpect(jsonPath("$.status").value("OPEN"))
				.andExpect(jsonPath("$.createdAt", notNullValue()))
				.andReturn();
		String reportId = JsonPath.read(reportResult.getResponse().getContentAsString(), "$.id");

		reportPost(reporterAccessToken, postId)
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value(reportId));

		assertThat(forumPostReportRepository.count()).isEqualTo(1);
	}

	@Test
	void reportPostAllowsEmptyDetails() throws Exception {
		String authorAccessToken = registerVerifyAndLogin("no-details-owner@example.com");
		String reporterAccessToken = registerVerifyAndLogin("no-details-reporter@example.com");
		MvcResult createResult = createPost(authorAccessToken, "introductions").andExpect(status().isCreated()).andReturn();
		String postId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

		mockMvc.perform(post("/api/community/posts/{postId}/reports", postId)
						.header("Authorization", "Bearer " + reporterAccessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "reason": "unsafe_advice"
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.details").value(nullValue()));
	}

	private org.springframework.test.web.servlet.ResultActions createPost(String accessToken, String categorySlug)
			throws Exception {
		return mockMvc.perform(post("/api/community/posts")
				.header("Authorization", "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "categorySlug": "%s",
						  "title": "  Starting   here  ",
						  "body": "This is a longer first post body for the community.",
						  "acceptedCommunityGuidelines": true
						}
						""".formatted(categorySlug)));
	}

	private org.springframework.test.web.servlet.ResultActions reportPost(String accessToken, String postId)
			throws Exception {
		return mockMvc.perform(post("/api/community/posts/{postId}/reports", postId)
				.header("Authorization", "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "reason": "medical_misinformation",
						  "details": "This needs a moderator look."
						}
						"""));
	}

	private String registerVerifyAndLogin(String email) throws Exception {
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

		return loginActiveMember(email);
	}

	private MvcResult registerNewMember(String email) throws Exception {
		return mockMvc.perform(post("/api/auth/register")
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
				.andExpect(status().isCreated())
				.andReturn();
	}

	private String loginActiveMemberByRepositoryBypass(String email) throws Exception {
		UserAccount user = userAccountRepository.findByEmail(email).orElseThrow();
		user.verifyEmail();
		userAccountRepository.saveAndFlush(user);
		String accessToken = loginActiveMember(email);
		user = userAccountRepository.findByEmail(email).orElseThrow();
		user.softDelete();
		userAccountRepository.saveAndFlush(user);

		return accessToken;
	}

	private String loginActiveMember(String email) throws Exception {
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
