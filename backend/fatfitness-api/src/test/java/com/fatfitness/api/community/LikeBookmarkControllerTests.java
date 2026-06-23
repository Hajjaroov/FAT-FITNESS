package com.fatfitness.api.community;

import static org.hamcrest.Matchers.hasSize;
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
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class LikeBookmarkControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	@Test
	void unauthenticatedPostListHasNullPersonalizedFields() throws Exception {
		String authorToken = registerVerifyAndLogin("anon-list-author@example.com");
		createPost(authorToken, "introductions");

		mockMvc.perform(get("/api/community/posts"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].likeCount").value(0))
				.andExpect(jsonPath("$[0].likedByCurrentUser").isEmpty())
				.andExpect(jsonPath("$[0].bookmarkedByCurrentUser").isEmpty());
	}

	@Test
	void likePostRequiresAuthentication() throws Exception {
		String authorToken = registerVerifyAndLogin("like-auth-author@example.com");
		String postId = createPostAndReadId(authorToken, "introductions");

		mockMvc.perform(post("/api/community/posts/{postId}/like", postId))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void bookmarkPostRequiresAuthentication() throws Exception {
		String authorToken = registerVerifyAndLogin("bookmark-auth-author@example.com");
		String postId = createPostAndReadId(authorToken, "introductions");

		mockMvc.perform(post("/api/community/posts/{postId}/bookmark", postId))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void likeCommentRequiresAuthentication() throws Exception {
		String authorToken = registerVerifyAndLogin("comment-like-auth-author@example.com");
		String postId = createPostAndReadId(authorToken, "introductions");
		String commentId = createCommentAndReadId(authorToken, postId);

		mockMvc.perform(post("/api/community/comments/{commentId}/like", commentId))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void getBookmarksRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/community/bookmarks"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void togglePostLikeTogglesOnAndOff() throws Exception {
		String authorToken = registerVerifyAndLogin("post-like-toggle-author@example.com");
		String likerToken = registerVerifyAndLogin("post-like-toggler@example.com");
		String postId = createPostAndReadId(authorToken, "introductions");

		mockMvc.perform(post("/api/community/posts/{postId}/like", postId)
						.header("Authorization", "Bearer " + likerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.liked").value(true))
				.andExpect(jsonPath("$.likeCount").value(1));

		mockMvc.perform(post("/api/community/posts/{postId}/like", postId)
						.header("Authorization", "Bearer " + likerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.liked").value(false))
				.andExpect(jsonPath("$.likeCount").value(0));
	}

	@Test
	void toggleCommentLikeTogglesOnAndOff() throws Exception {
		String authorToken = registerVerifyAndLogin("comment-like-toggle-author@example.com");
		String likerToken = registerVerifyAndLogin("comment-like-toggler@example.com");
		String postId = createPostAndReadId(authorToken, "introductions");
		String commentId = createCommentAndReadId(authorToken, postId);

		mockMvc.perform(post("/api/community/comments/{commentId}/like", commentId)
						.header("Authorization", "Bearer " + likerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.liked").value(true))
				.andExpect(jsonPath("$.likeCount").value(1));

		mockMvc.perform(post("/api/community/comments/{commentId}/like", commentId)
						.header("Authorization", "Bearer " + likerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.liked").value(false))
				.andExpect(jsonPath("$.likeCount").value(0));
	}

	@Test
	void togglePostBookmarkTogglesOnAndOff() throws Exception {
		String authorToken = registerVerifyAndLogin("bookmark-toggle-author@example.com");
		String bookmarkerToken = registerVerifyAndLogin("bookmark-toggler@example.com");
		String postId = createPostAndReadId(authorToken, "introductions");

		mockMvc.perform(post("/api/community/posts/{postId}/bookmark", postId)
						.header("Authorization", "Bearer " + bookmarkerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.bookmarked").value(true));

		mockMvc.perform(post("/api/community/posts/{postId}/bookmark", postId)
						.header("Authorization", "Bearer " + bookmarkerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.bookmarked").value(false));
	}

	@Test
	void authenticatedUserSeesOwnLikeAndBookmarkState() throws Exception {
		String authorToken = registerVerifyAndLogin("personalized-post-author@example.com");
		String userToken = registerVerifyAndLogin("personalized-user@example.com");
		String postId = createPostAndReadId(authorToken, "introductions");

		mockMvc.perform(post("/api/community/posts/{postId}/like", postId)
				.header("Authorization", "Bearer " + userToken));
		mockMvc.perform(post("/api/community/posts/{postId}/bookmark", postId)
				.header("Authorization", "Bearer " + userToken));

		mockMvc.perform(get("/api/community/posts/{postId}", postId)
						.header("Authorization", "Bearer " + userToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.likeCount").value(1))
				.andExpect(jsonPath("$.likedByCurrentUser").value(true))
				.andExpect(jsonPath("$.bookmarkedByCurrentUser").value(true));

		mockMvc.perform(get("/api/community/posts/{postId}", postId)
						.header("Authorization", "Bearer " + authorToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.likeCount").value(1))
				.andExpect(jsonPath("$.likedByCurrentUser").value(false))
				.andExpect(jsonPath("$.bookmarkedByCurrentUser").value(false));
	}

	@Test
	void bookmarkedPostAppearsInBookmarkList() throws Exception {
		String authorToken = registerVerifyAndLogin("bookmark-list-author@example.com");
		String userToken = registerVerifyAndLogin("bookmark-list-user@example.com");
		String postId = createPostAndReadId(authorToken, "introductions");

		mockMvc.perform(post("/api/community/posts/{postId}/bookmark", postId)
				.header("Authorization", "Bearer " + userToken))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/community/bookmarks")
						.header("Authorization", "Bearer " + userToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].id").value(postId))
				.andExpect(jsonPath("$[0].bookmarkedByCurrentUser").value(true));
	}

	@Test
	void unbookmarkedPostDoesNotAppearInBookmarkList() throws Exception {
		String authorToken = registerVerifyAndLogin("unbookmark-author@example.com");
		String userToken = registerVerifyAndLogin("unbookmark-user@example.com");
		String postId = createPostAndReadId(authorToken, "introductions");

		mockMvc.perform(post("/api/community/posts/{postId}/bookmark", postId)
				.header("Authorization", "Bearer " + userToken));
		mockMvc.perform(post("/api/community/posts/{postId}/bookmark", postId)
				.header("Authorization", "Bearer " + userToken));

		mockMvc.perform(get("/api/community/bookmarks")
						.header("Authorization", "Bearer " + userToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void commentLikeCountAppearsInCommentList() throws Exception {
		String authorToken = registerVerifyAndLogin("comment-count-author@example.com");
		String likerToken = registerVerifyAndLogin("comment-count-liker@example.com");
		String postId = createPostAndReadId(authorToken, "introductions");
		String commentId = createCommentAndReadId(authorToken, postId);

		mockMvc.perform(post("/api/community/comments/{commentId}/like", commentId)
				.header("Authorization", "Bearer " + likerToken));

		mockMvc.perform(get("/api/community/posts/{postId}/comments", postId)
						.header("Authorization", "Bearer " + likerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].likeCount").value(1))
				.andExpect(jsonPath("$[0].likedByCurrentUser").value(true));
	}

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

	private void createPost(String accessToken, String categorySlug) throws Exception {
		createPostAndReadId(accessToken, categorySlug);
	}

	private String createCommentAndReadId(String accessToken, String postId) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/community/posts/{postId}/comments", postId)
						.header("Authorization", "Bearer " + accessToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "body": "A first reply on this thread.",
								  "acceptedCommunityGuidelines": true
								}
								"""))
				.andExpect(status().isCreated())
				.andReturn();
		return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
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
