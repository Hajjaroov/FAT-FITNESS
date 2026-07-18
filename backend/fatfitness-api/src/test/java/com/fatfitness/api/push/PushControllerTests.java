package com.fatfitness.api.push;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.push.entity.PushSubscription;
import com.fatfitness.api.push.repository.PushSubscriptionRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.repository.UserAccountRepository;
import com.jayway.jsonpath.JsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PushControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private PushSubscriptionRepository pushSubscriptionRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	@Test
	void subscribeRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/push/subscriptions")
						.contentType(MediaType.APPLICATION_JSON)
						.content(subscribeBody("https://push.example.com/endpoint-1")))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void unsubscribeRequiresAuthentication() throws Exception {
		mockMvc.perform(delete("/api/push/subscriptions")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "endpoint": "https://push.example.com/endpoint-1" }
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void subscribeCreatesRowOwnedByCaller() throws Exception {
		String token = registerVerifyAndLogin("push-subscribe@example.com");
		UUID userId = userId("push-subscribe@example.com");
		String endpoint = "https://push.example.com/" + UUID.randomUUID();

		mockMvc.perform(post("/api/push/subscriptions")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(subscribeBody(endpoint)))
				.andExpect(status().isCreated());

		Optional<PushSubscription> stored = pushSubscriptionRepository.findByEndpoint(endpoint);
		assertThat(stored).isPresent();
		assertThat(stored.get().getUser().getId()).isEqualTo(userId);
		assertThat(stored.get().getP256dh()).isEqualTo("p256dh-key");
	}

	@Test
	void resubscribingSameEndpointUpdatesRowInsteadOfDuplicating() throws Exception {
		String token = registerVerifyAndLogin("push-resubscribe@example.com");
		String endpoint = "https://push.example.com/" + UUID.randomUUID();

		mockMvc.perform(post("/api/push/subscriptions")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(subscribeBody(endpoint)))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/api/push/subscriptions")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "endpoint": "%s", "p256dh": "p256dh-key-updated", "auth": "auth-key" }
								""".formatted(endpoint)))
				.andExpect(status().isCreated());

		assertThat(pushSubscriptionRepository.findByEndpoint(endpoint)).hasValueSatisfying(
				subscription -> assertThat(subscription.getP256dh()).isEqualTo("p256dh-key-updated"));
	}

	@Test
	void subscribingSameEndpointAsDifferentUserReassignsOwnership() throws Exception {
		String firstToken = registerVerifyAndLogin("push-owner-a@example.com");
		String secondToken = registerVerifyAndLogin("push-owner-b@example.com");
		UUID secondUserId = userId("push-owner-b@example.com");
		String endpoint = "https://push.example.com/" + UUID.randomUUID();

		mockMvc.perform(post("/api/push/subscriptions")
						.header("Authorization", "Bearer " + firstToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content(subscribeBody(endpoint)))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/api/push/subscriptions")
						.header("Authorization", "Bearer " + secondToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content(subscribeBody(endpoint)))
				.andExpect(status().isCreated());

		assertThat(pushSubscriptionRepository.findByEndpoint(endpoint)).hasValueSatisfying(
				subscription -> assertThat(subscription.getUser().getId()).isEqualTo(secondUserId));
	}

	@Test
	void unsubscribeIsIdempotentWhenNoSubscriptionExists() throws Exception {
		String token = registerVerifyAndLogin("push-unsub-none@example.com");

		mockMvc.perform(delete("/api/push/subscriptions")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "endpoint": "https://push.example.com/never-subscribed" }
								"""))
				.andExpect(status().isNoContent());
	}

	@Test
	void unsubscribeOnlyDeletesCallersOwnRow() throws Exception {
		String ownerToken = registerVerifyAndLogin("push-unsub-owner@example.com");
		String otherToken = registerVerifyAndLogin("push-unsub-other@example.com");
		String endpoint = "https://push.example.com/" + UUID.randomUUID();

		mockMvc.perform(post("/api/push/subscriptions")
						.header("Authorization", "Bearer " + ownerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content(subscribeBody(endpoint)))
				.andExpect(status().isCreated());

		// Another user's unsubscribe for the same endpoint string is a no-op — it does
		// not own the row.
		mockMvc.perform(delete("/api/push/subscriptions")
						.header("Authorization", "Bearer " + otherToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "endpoint": "%s" }
								""".formatted(endpoint)))
				.andExpect(status().isNoContent());

		assertThat(pushSubscriptionRepository.findByEndpoint(endpoint)).isPresent();

		mockMvc.perform(delete("/api/push/subscriptions")
						.header("Authorization", "Bearer " + ownerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "endpoint": "%s" }
								""".formatted(endpoint)))
				.andExpect(status().isNoContent());

		assertThat(pushSubscriptionRepository.findByEndpoint(endpoint)).isEmpty();
	}

	private static String subscribeBody(String endpoint) {
		return """
				{ "endpoint": "%s", "p256dh": "p256dh-key", "auth": "auth-key" }
				""".formatted(endpoint);
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
								  "displayName": "Push Tester",
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
