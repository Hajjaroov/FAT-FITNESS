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
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.community.repository.ForumCommentReportRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ForumCommentControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ForumCommentReportRepository forumCommentReportRepository;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	@Test
	void listCommentsStartsEmptyForPublishedPost() throws Exception {
		String accessToken = registerVerifyAndLogin("empty-comments-owner@example.com");
		String postId = createPostAndReadId(accessToken, "introductions");

		mockMvc.perform(get("/api/community/posts/{postId}/comments", postId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void listCommentsRejectsUnknownPost() throws Exception {
		mockMvc.perform(get("/api/community/posts/{postId}/comments", "00000000-0000-0000-0000-000000000000"))
				.andExpect(status().isNotFound());
	}

	@Test
	void createCommentRequiresAuthentication() throws Exception {
		String accessToken = registerVerifyAndLogin("comment-auth-owner@example.com");
		String postId = createPostAndReadId(accessToken, "introductions");

		mockMvc.perform(post("/api/community/posts/{postId}/comments", postId)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "body": "A first reply on this thread.",
								  "acceptedCommunityGuidelines": true
								}
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void createCommentPersistsPublishedCommentAndPublicReadsReturnIt() throws Exception {
		String authorAccessToken = registerVerifyAndLogin("comment-post-owner@example.com");
		String commenterAccessToken = registerVerifyAndLogin("commenter@example.com");
		String postId = createPostAndReadId(authorAccessToken, "questions-and-support");

		MvcResult createResult = createComment(commenterAccessToken, postId)
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id", notNullValue()))
				.andExpect(jsonPath("$.postId").value(postId))
				.andExpect(jsonPath("$.body").value("A first reply on this thread."))
				.andExpect(jsonPath("$.authorDisplayName").value("Forum Member"))
				.andExpect(jsonPath("$.status").value("PUBLISHED"))
				.andExpect(jsonPath("$.createdAt", notNullValue()))
				.andExpect(jsonPath("$.updatedAt", notNullValue()))
				.andReturn();
		String commentId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

		mockMvc.perform(get("/api/community/posts/{postId}/comments", postId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].id").value(commentId))
				.andExpect(jsonPath("$[0].body").value("A first reply on this thread."));
	}

	@Test
	void createCommentRequiresGuidelinesAcceptance() throws Exception {
		String accessToken = registerVerifyAndLogin("comment-guidelines@example.com");
		String postId = createPostAndReadId(accessToken, "introductions");

		mockMvc.perform(post("/api/community/posts/{postId}/comments", postId)
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "body": "A first reply on this thread.",
								  "acceptedCommunityGuidelines": false
								}
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void createCommentRejectsAccountThatBecameInactiveAfterTokenIssued() throws Exception {
		String authorAccessToken = registerVerifyAndLogin("inactive-comment-owner@example.com");
		String postId = createPostAndReadId(authorAccessToken, "introductions");
		registerNewMember("inactive-commenter@example.com");
		String inactiveAccessToken = loginActiveMemberByRepositoryBypass("inactive-commenter@example.com");

		createComment(inactiveAccessToken, postId)
				.andExpect(status().isForbidden());
	}

	@Test
	void publicCommentReadUsesBannedAuthorDisplayName() throws Exception {
		String postAccessToken = registerVerifyAndLogin("comment-display-post-owner@example.com");
		String commenterAccessToken = registerVerifyAndLogin("comment-display-name@example.com");
		String postId = createPostAndReadId(postAccessToken, "introductions");
		createComment(commenterAccessToken, postId).andExpect(status().isCreated());
		UserAccount author = userAccountRepository.findByEmail("comment-display-name@example.com").orElseThrow();
		author.ban();
		userAccountRepository.saveAndFlush(author);

		mockMvc.perform(get("/api/community/posts/{postId}/comments", postId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].authorDisplayName").value("Banned account"));
	}

	@Test
	void reportCommentRequiresAuthentication() throws Exception {
		String authorAccessToken = registerVerifyAndLogin("comment-report-owner@example.com");
		String commenterAccessToken = registerVerifyAndLogin("reported-commenter@example.com");
		String postId = createPostAndReadId(authorAccessToken, "introductions");
		String commentId = createCommentAndReadId(commenterAccessToken, postId);

		mockMvc.perform(post("/api/community/comments/{commentId}/reports", commentId)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "reason": "unsafe_advice",
								  "details": "This needs a moderator look."
								}
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void reportCommentCreatesOpenReportAndIsIdempotentForSameReporter() throws Exception {
		String authorAccessToken = registerVerifyAndLogin("comment-report-post-owner@example.com");
		String commenterAccessToken = registerVerifyAndLogin("comment-report-commenter@example.com");
		String reporterAccessToken = registerVerifyAndLogin("comment-reporter@example.com");
		String postId = createPostAndReadId(authorAccessToken, "questions-and-support");
		String commentId = createCommentAndReadId(commenterAccessToken, postId);

		MvcResult reportResult = reportComment(reporterAccessToken, commentId)
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id", notNullValue()))
				.andExpect(jsonPath("$.commentId").value(commentId))
				.andExpect(jsonPath("$.reason").value("unsafe_advice"))
				.andExpect(jsonPath("$.details").value("This needs a moderator look."))
				.andExpect(jsonPath("$.status").value("OPEN"))
				.andExpect(jsonPath("$.createdAt", notNullValue()))
				.andReturn();
		String reportId = JsonPath.read(reportResult.getResponse().getContentAsString(), "$.id");

		reportComment(reporterAccessToken, commentId)
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value(reportId));

		assertThat(forumCommentReportRepository.count()).isEqualTo(1);
	}

	@Test
	void reportCommentAllowsEmptyDetails() throws Exception {
		String authorAccessToken = registerVerifyAndLogin("comment-no-details-owner@example.com");
		String commenterAccessToken = registerVerifyAndLogin("comment-no-details-commenter@example.com");
		String reporterAccessToken = registerVerifyAndLogin("comment-no-details-reporter@example.com");
		String postId = createPostAndReadId(authorAccessToken, "introductions");
		String commentId = createCommentAndReadId(commenterAccessToken, postId);

		mockMvc.perform(post("/api/community/comments/{commentId}/reports", commentId)
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

	private String createPostAndReadId(String accessToken, String categorySlug) throws Exception {
		MvcResult createResult = createPost(accessToken, categorySlug)
				.andExpect(status().isCreated())
				.andReturn();

		return JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");
	}

	private String createCommentAndReadId(String accessToken, String postId) throws Exception {
		MvcResult createResult = createComment(accessToken, postId)
				.andExpect(status().isCreated())
				.andReturn();

		return JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");
	}

	private ResultActions createPost(String accessToken, String categorySlug) throws Exception {
		return mockMvc.perform(post("/api/community/posts")
				.header("Authorization", "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "categorySlug": "%s",
						  "title": "Starting here",
						  "body": "This is a longer first post body for the community.",
						  "acceptedCommunityGuidelines": true
						}
						""".formatted(categorySlug)));
	}

	private ResultActions createComment(String accessToken, String postId) throws Exception {
		return mockMvc.perform(post("/api/community/posts/{postId}/comments", postId)
				.header("Authorization", "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "body": "A first reply on this thread.",
						  "acceptedCommunityGuidelines": true
						}
						"""));
	}

	private ResultActions reportComment(String accessToken, String commentId) throws Exception {
		return mockMvc.perform(post("/api/community/comments/{commentId}/reports", commentId)
				.header("Authorization", "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "reason": "unsafe_advice",
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
