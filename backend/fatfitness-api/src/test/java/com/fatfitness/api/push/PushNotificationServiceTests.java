package com.fatfitness.api.push;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.push.repository.PushSubscriptionRepository;
import com.fatfitness.api.push.service.PushSendOutcome;
import com.fatfitness.api.push.service.PushSender;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.repository.UserAccountRepository;
import com.jayway.jsonpath.JsonPath;

// Deliberately NOT @Transactional: notifyNewMessage() runs on a dedicated
// executor thread that opens its own DB connection/transaction, so it cannot
// see rows written by the test method's thread-bound transaction unless they
// are actually committed (same reasoning as OwnerAccountSeederTests). Each
// test uses unique emails/endpoints so leftover rows never collide.
@SpringBootTest
@AutoConfigureMockMvc
class PushNotificationServiceTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private PushSubscriptionRepository pushSubscriptionRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	@MockitoBean
	private PushSender pushSender;

	@Test
	void replyToConversationSendsPushToSubscribedRecipient() throws Exception {
		when(pushSender.send(anyString(), anyString(), anyString(), anyString()))
				.thenReturn(new PushSendOutcome(201));

		String senderToken = registerVerifyAndLogin("push-flow-sender@example.com");
		String recipientToken = registerVerifyAndLogin("push-flow-recipient@example.com");
		String endpoint = "https://push.example.com/" + UUID.randomUUID();

		subscribe(recipientToken, endpoint);

		mockMvc.perform(post("/api/messages")
						.header("Authorization", "Bearer " + senderToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "recipientId": "%s",
								  "subject": "Push test",
								  "body": "First message."
								}
								""".formatted(userId("push-flow-recipient@example.com"))))
				.andExpect(status().isCreated());

		// notifyNewMessage runs on a dedicated executor thread, not the request thread.
		verify(pushSender, org.mockito.Mockito.timeout(2000))
				.send(eq(endpoint), eq("p256dh-key"), eq("auth-key"), anyString());
	}

	@Test
	void expiredEndpointResponseDeletesSubscription() throws Exception {
		when(pushSender.send(anyString(), anyString(), anyString(), anyString()))
				.thenReturn(new PushSendOutcome(410));

		String senderToken = registerVerifyAndLogin("push-expired-sender@example.com");
		String recipientToken = registerVerifyAndLogin("push-expired-recipient@example.com");
		String endpoint = "https://push.example.com/" + UUID.randomUUID();

		subscribe(recipientToken, endpoint);

		mockMvc.perform(post("/api/messages")
						.header("Authorization", "Bearer " + senderToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "recipientId": "%s",
								  "subject": "Expired endpoint test",
								  "body": "First message."
								}
								""".formatted(userId("push-expired-recipient@example.com"))))
				.andExpect(status().isCreated());

		await().atMost(Duration.ofSeconds(2)).untilAsserted(() ->
				assertThat(pushSubscriptionRepository.findByEndpoint(endpoint)).isEmpty());
	}

	private void subscribe(String token, String endpoint) throws Exception {
		mockMvc.perform(post("/api/push/subscriptions")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "endpoint": "%s", "p256dh": "p256dh-key", "auth": "auth-key" }
								""".formatted(endpoint)))
				.andExpect(status().isCreated());
	}

	private UUID userId(String email) {
		UserAccount user = userAccountRepository.findByEmail(email.toLowerCase()).orElseThrow();
		return user.getId();
	}

	private String registerVerifyAndLogin(String email) throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "Push Flow Tester",
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
								{ "token": "%s" }
								""".formatted(created.rawToken())))
				.andExpect(status().isOk());

		var loginResult = mockMvc.perform(post("/api/auth/login")
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
