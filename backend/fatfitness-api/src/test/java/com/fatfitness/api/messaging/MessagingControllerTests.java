package com.fatfitness.api.messaging;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MessagingControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	@Test
	void startConversationRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/messages")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "recipientId": "00000000-0000-0000-0000-000000000000",
								  "subject": "Hello there",
								  "body": "A first message."
								}
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void startConversationCreatesThreadAndRecipientSeesUnreadInbox() throws Exception {
		String senderToken = registerVerifyAndLogin("dm-sender@example.com");
		String recipientToken = registerVerifyAndLogin("dm-recipient@example.com");
		UUID recipientId = userId("dm-recipient@example.com");

		startConversation(senderToken, recipientId, "Welcome", "Hi, glad you are here.")
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.conversationId", notNullValue()))
				.andExpect(jsonPath("$.subject").value("Welcome"))
				.andExpect(jsonPath("$.otherParticipantId").value(recipientId.toString()))
				.andExpect(jsonPath("$.messages", hasSize(1)))
				.andExpect(jsonPath("$.messages[0].body").value("Hi, glad you are here."));

		// Recipient sees one unread conversation.
		mockMvc.perform(get("/api/messages").header("Authorization", "Bearer " + recipientToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].unread").value(true))
				.andExpect(jsonPath("$[0].lastMessagePreview").value("Hi, glad you are here."));

		mockMvc.perform(get("/api/messages/unread-count").header("Authorization", "Bearer " + recipientToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.count").value(1));

		// Sender's own copy is not unread (they wrote the last message).
		mockMvc.perform(get("/api/messages").header("Authorization", "Bearer " + senderToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].unread").value(false));

		mockMvc.perform(get("/api/messages/unread-count").header("Authorization", "Bearer " + senderToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.count").value(0));
	}

	@Test
	void startConversationRejectsMessagingYourself() throws Exception {
		String token = registerVerifyAndLogin("dm-self@example.com");
		UUID selfId = userId("dm-self@example.com");

		startConversation(token, selfId, "Note to self", "Talking to myself.")
				.andExpect(status().isBadRequest());
	}

	@Test
	void startConversationRejectsUnknownRecipient() throws Exception {
		String token = registerVerifyAndLogin("dm-unknown@example.com");

		startConversation(token, UUID.randomUUID(), "Hello", "Anybody home?")
				.andExpect(status().isNotFound());
	}

	@Test
	void getThreadMarksConversationRead() throws Exception {
		String senderToken = registerVerifyAndLogin("dm-read-sender@example.com");
		String recipientToken = registerVerifyAndLogin("dm-read-recipient@example.com");
		UUID recipientId = userId("dm-read-recipient@example.com");

		MvcResult start = startConversation(senderToken, recipientId, "Read test", "Please read this.")
				.andExpect(status().isCreated())
				.andReturn();
		String conversationId = JsonPath.read(start.getResponse().getContentAsString(), "$.conversationId");

		// Before reading: unread = 1.
		mockMvc.perform(get("/api/messages/unread-count").header("Authorization", "Bearer " + recipientToken))
				.andExpect(jsonPath("$.count").value(1));

		// Open the thread.
		mockMvc.perform(get("/api/messages/{id}", conversationId)
						.header("Authorization", "Bearer " + recipientToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.messages", hasSize(1)));

		// After reading: unread = 0.
		mockMvc.perform(get("/api/messages/unread-count").header("Authorization", "Bearer " + recipientToken))
				.andExpect(jsonPath("$.count").value(0));
	}

	@Test
	void getThreadRejectsNonParticipant() throws Exception {
		String senderToken = registerVerifyAndLogin("dm-part-sender@example.com");
		String recipientToken = registerVerifyAndLogin("dm-part-recipient@example.com");
		String outsiderToken = registerVerifyAndLogin("dm-part-outsider@example.com");
		UUID recipientId = userId("dm-part-recipient@example.com");

		MvcResult start = startConversation(senderToken, recipientId, "Private", "Only for us.")
				.andExpect(status().isCreated())
				.andReturn();
		String conversationId = JsonPath.read(start.getResponse().getContentAsString(), "$.conversationId");

		mockMvc.perform(get("/api/messages/{id}", conversationId)
						.header("Authorization", "Bearer " + outsiderToken))
				.andExpect(status().isNotFound());

		// A participant can read it.
		mockMvc.perform(get("/api/messages/{id}", conversationId)
						.header("Authorization", "Bearer " + recipientToken))
				.andExpect(status().isOk());
	}

	@Test
	void replyAddsMessageAndBringsConversationBackForOtherSide() throws Exception {
		String senderToken = registerVerifyAndLogin("dm-reply-sender@example.com");
		String recipientToken = registerVerifyAndLogin("dm-reply-recipient@example.com");
		UUID recipientId = userId("dm-reply-recipient@example.com");

		MvcResult start = startConversation(senderToken, recipientId, "Chat", "First message.")
				.andExpect(status().isCreated())
				.andReturn();
		String conversationId = JsonPath.read(start.getResponse().getContentAsString(), "$.conversationId");

		// Recipient replies.
		mockMvc.perform(post("/api/messages/{id}/reply", conversationId)
						.header("Authorization", "Bearer " + recipientToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "body": "Thanks for reaching out."
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.body").value("Thanks for reaching out."));

		// Sender now has an unread reply and the thread has two messages.
		mockMvc.perform(get("/api/messages/unread-count").header("Authorization", "Bearer " + senderToken))
				.andExpect(jsonPath("$.count").value(1));

		mockMvc.perform(get("/api/messages/{id}", conversationId)
						.header("Authorization", "Bearer " + senderToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.messages", hasSize(2)));
	}

	@Test
	void deleteConversationHidesItFromInboxForCurrentUserOnly() throws Exception {
		String senderToken = registerVerifyAndLogin("dm-del-sender@example.com");
		String recipientToken = registerVerifyAndLogin("dm-del-recipient@example.com");
		UUID recipientId = userId("dm-del-recipient@example.com");

		MvcResult start = startConversation(senderToken, recipientId, "Delete me", "Temporary chat.")
				.andExpect(status().isCreated())
				.andReturn();
		String conversationId = JsonPath.read(start.getResponse().getContentAsString(), "$.conversationId");

		mockMvc.perform(delete("/api/messages/{id}", conversationId)
						.header("Authorization", "Bearer " + senderToken))
				.andExpect(status().isNoContent());

		// Sender no longer sees it; the thread is gone for them.
		mockMvc.perform(get("/api/messages").header("Authorization", "Bearer " + senderToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));

		mockMvc.perform(get("/api/messages/{id}", conversationId)
						.header("Authorization", "Bearer " + senderToken))
				.andExpect(status().isNotFound());

		// Recipient still sees it.
		mockMvc.perform(get("/api/messages").header("Authorization", "Bearer " + recipientToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)));
	}

	@Test
	void deletedConversationReappearsForUserWhenTheOtherSideReplies() throws Exception {
		String senderToken = registerVerifyAndLogin("dm-restore-sender@example.com");
		String recipientToken = registerVerifyAndLogin("dm-restore-recipient@example.com");
		UUID recipientId = userId("dm-restore-recipient@example.com");

		MvcResult start = startConversation(senderToken, recipientId, "Restore", "Hello again.")
				.andExpect(status().isCreated())
				.andReturn();
		String conversationId = JsonPath.read(start.getResponse().getContentAsString(), "$.conversationId");

		// Recipient deletes their side.
		mockMvc.perform(delete("/api/messages/{id}", conversationId)
						.header("Authorization", "Bearer " + recipientToken))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/messages").header("Authorization", "Bearer " + recipientToken))
				.andExpect(jsonPath("$", hasSize(0)));

		// Sender replies; the conversation comes back for the recipient.
		mockMvc.perform(post("/api/messages/{id}/reply", conversationId)
						.header("Authorization", "Bearer " + senderToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "body": "Are you still there?"
								}
								"""))
				.andExpect(status().isCreated());

		mockMvc.perform(get("/api/messages").header("Authorization", "Bearer " + recipientToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].unread").value(true));
	}

	@Test
	void ownerCanBroadcastToAllActiveMembers() throws Exception {
		String ownerToken = registerVerifyAndLogin("dm-broadcast-owner@example.com");
		elevate("dm-broadcast-owner@example.com", UserRole.OWNER);
		String aToken = registerVerifyAndLogin("dm-broadcast-a@example.com");
		String bToken = registerVerifyAndLogin("dm-broadcast-b@example.com");

		mockMvc.perform(post("/api/messages/broadcast")
						.header("Authorization", "Bearer " + ownerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "subject": "Welcome everyone",
								  "body": "A community-wide announcement."
								}
								"""))
				.andExpect(status().isCreated())
				// >= 2 rather than == 2: other test contexts may commit ACTIVE users
				// (e.g. the seeded owner) that also receive the broadcast.
				.andExpect(jsonPath("$.recipientCount", greaterThanOrEqualTo(2)));

		// Each member I created receives exactly their own unread broadcast conversation.
		mockMvc.perform(get("/api/messages").header("Authorization", "Bearer " + aToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].unread").value(true))
				.andExpect(jsonPath("$[0].subject").value("Welcome everyone"));

		mockMvc.perform(get("/api/messages").header("Authorization", "Bearer " + bToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)));

		// The owner sent to at least the two members above (never to themselves).
		mockMvc.perform(get("/api/messages").header("Authorization", "Bearer " + ownerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()", greaterThanOrEqualTo(2)));
	}

	@Test
	void regularMemberCannotBroadcast() throws Exception {
		String token = registerVerifyAndLogin("dm-broadcast-regular@example.com");

		mockMvc.perform(post("/api/messages/broadcast")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "subject": "Not allowed",
								  "body": "Regular members cannot do this."
								}
								"""))
				.andExpect(status().isForbidden());
	}

	@Test
	void broadcastRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/messages/broadcast")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "subject": "No token",
								  "body": "Should be rejected."
								}
								"""))
				.andExpect(status().isUnauthorized());
	}

	private void elevate(String email, UserRole role) {
		UserAccount user = userAccountRepository.findByEmail(email.toLowerCase()).orElseThrow();
		user.addRole(role);
		userAccountRepository.saveAndFlush(user);
	}

	private ResultActions startConversation(String accessToken, UUID recipientId, String subject, String body)
			throws Exception {
		return mockMvc.perform(post("/api/messages")
				.header("Authorization", "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "recipientId": "%s",
						  "subject": "%s",
						  "body": "%s"
						}
						""".formatted(recipientId, subject, body)));
	}

	private UUID userId(String email) {
		UserAccount user = userAccountRepository.findByEmail(email.toLowerCase()).orElseThrow();
		return user.getId();
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

	private void registerNewMember(String email) throws Exception {
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
