package com.fatfitness.api.push.service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import tools.jackson.databind.ObjectMapper;

import com.fatfitness.api.push.entity.PushSubscription;
import com.fatfitness.api.push.repository.PushSubscriptionRepository;

import jakarta.annotation.PreDestroy;

/**
 * Sends new-message push notifications. Callers (MessagingService) run inside
 * @Transactional methods, so sends happen on a dedicated executor thread —
 * never on the caller's thread — and never throw back into the caller. This
 * mirrors why broadcast emails were moved out of the DB transaction in the
 * 2026-07-18 performance pass: blocking HTTP calls must not hold a DB
 * connection open.
 */
@Service
public class PushNotificationService {

	private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);

	private final PushSubscriptionRepository pushSubscriptionRepository;
	private final PushSender pushSender;
	private final ObjectMapper objectMapper;
	private final ExecutorService executor = Executors.newSingleThreadExecutor(runnable -> {
		Thread thread = new Thread(runnable, "push-notification");
		thread.setDaemon(true);
		return thread;
	});

	public PushNotificationService(
			PushSubscriptionRepository pushSubscriptionRepository, PushSender pushSender, ObjectMapper objectMapper) {
		this.pushSubscriptionRepository = pushSubscriptionRepository;
		this.pushSender = pushSender;
		this.objectMapper = objectMapper;
	}

	public void notifyNewMessage(UUID recipientUserId, String senderDisplayName, String subject, UUID conversationId) {
		executor.submit(() -> sendToUser(recipientUserId, senderDisplayName, subject, conversationId));
	}

	private void sendToUser(UUID recipientUserId, String senderDisplayName, String subject, UUID conversationId) {
		List<PushSubscription> subscriptions = pushSubscriptionRepository.findByUserId(recipientUserId);
		if (subscriptions.isEmpty()) {
			return;
		}

		String payload = buildPayload(senderDisplayName, subject, conversationId);
		for (PushSubscription subscription : subscriptions) {
			sendOne(subscription, payload);
		}
	}

	private void sendOne(PushSubscription subscription, String payloadJson) {
		try {
			PushSendOutcome outcome = pushSender.send(
					subscription.getEndpoint(), subscription.getP256dh(), subscription.getAuth(), payloadJson);
			if (outcome.isExpired()) {
				pushSubscriptionRepository.deleteByEndpoint(subscription.getEndpoint());
			}
		}
		catch (Exception ex) {
			log.warn("push.send_failed endpoint={} message={}", subscription.getEndpoint(), ex.getMessage());
		}
	}

	private String buildPayload(String senderDisplayName, String subject, UUID conversationId) {
		try {
			return objectMapper.writeValueAsString(
					new PushPayload("New message from " + senderDisplayName, subject, conversationId.toString()));
		}
		catch (Exception ex) {
			log.warn("push.payload_build_failed message={}", ex.getMessage());
			return "{}";
		}
	}

	@PreDestroy
	void shutdown() {
		executor.shutdown();
	}

	private record PushPayload(String title, String body, String conversationId) {
	}
}
