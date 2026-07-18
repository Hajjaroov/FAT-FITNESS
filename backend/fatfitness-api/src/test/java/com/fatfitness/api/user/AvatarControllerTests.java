package com.fatfitness.api.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.UUID;

import javax.imageio.ImageIO;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AvatarControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	@Test
	void uploadAvatarRequiresAuthentication() throws Exception {
		mockMvc.perform(multipart("/api/users/me/avatar")
						.file(new MockMultipartFile("avatar", "a.png", "image/png", pngBytes())))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void uploadAvatarThenServeItPublicly() throws Exception {
		String accessToken = registerVerifyAndLogin("avatar-upload@example.com");
		UUID userId = userAccountRepository.findByEmail("avatar-upload@example.com").orElseThrow().getId();

		mockMvc.perform(multipart("/api/users/me/avatar")
						.file(new MockMultipartFile("avatar", "me.png", "image/png", pngBytes()))
						.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isNoContent());

		UserAccount user = userAccountRepository.findById(userId).orElseThrow();
		assertThat(user.hasAvatar()).isTrue();

		MvcResult result = mockMvc.perform(get("/api/avatars/{userId}", userId.toString()))
				.andExpect(status().isOk())
				.andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE))
				.andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-cache, private"))
				.andExpect(header().exists(HttpHeaders.ETAG))
				.andReturn();

		assertThat(result.getResponse().getContentAsByteArray()).isNotEmpty();
	}

	@Test
	void getAvatarReturns304WhenETagMatches() throws Exception {
		String accessToken = registerVerifyAndLogin("avatar-etag@example.com");
		UUID userId = userAccountRepository.findByEmail("avatar-etag@example.com").orElseThrow().getId();

		mockMvc.perform(multipart("/api/users/me/avatar")
						.file(new MockMultipartFile("avatar", "me.png", "image/png", pngBytes()))
						.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isNoContent());

		MvcResult first = mockMvc.perform(get("/api/avatars/{userId}", userId.toString()))
				.andExpect(status().isOk())
				.andReturn();
		String etag = first.getResponse().getHeader(HttpHeaders.ETAG);
		assertThat(etag).isNotNull();

		MvcResult second = mockMvc.perform(get("/api/avatars/{userId}", userId.toString())
						.header(HttpHeaders.IF_NONE_MATCH, etag))
				.andExpect(status().isNotModified())
				.andExpect(header().string(HttpHeaders.ETAG, etag))
				.andReturn();

		assertThat(second.getResponse().getContentAsByteArray()).isEmpty();
	}

	@Test
	void uploadAvatarRejectsEmptyFile() throws Exception {
		String accessToken = registerVerifyAndLogin("avatar-empty@example.com");

		mockMvc.perform(multipart("/api/users/me/avatar")
						.file(new MockMultipartFile("avatar", "empty.png", "image/png", new byte[0]))
						.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isBadRequest());
	}

	@Test
	void uploadAvatarRejectsUnsupportedContentType() throws Exception {
		String accessToken = registerVerifyAndLogin("avatar-bad-type@example.com");

		mockMvc.perform(multipart("/api/users/me/avatar")
						.file(new MockMultipartFile("avatar", "note.txt", "text/plain", "not an image".getBytes()))
						.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isUnsupportedMediaType());
	}

	@Test
	void getAvatarReturnsNotFoundWhenNoAvatarUploaded() throws Exception {
		registerVerifyAndLogin("avatar-none@example.com");
		UUID userId = userAccountRepository.findByEmail("avatar-none@example.com").orElseThrow().getId();

		mockMvc.perform(get("/api/avatars/{userId}", userId.toString()))
				.andExpect(status().isNotFound());
	}

	@Test
	void getAvatarReturnsNotFoundForUnknownUser() throws Exception {
		mockMvc.perform(get("/api/avatars/{userId}", UUID.randomUUID().toString()))
				.andExpect(status().isNotFound());
	}

	// --- helpers ---

	private static byte[] pngBytes() throws Exception {
		BufferedImage image = new BufferedImage(64, 64, BufferedImage.TYPE_INT_RGB);
		image.createGraphics().fillRect(0, 0, 64, 64);
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		ImageIO.write(image, "png", out);
		return out.toByteArray();
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
