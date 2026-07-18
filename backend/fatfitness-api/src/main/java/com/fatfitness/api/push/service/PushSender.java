package com.fatfitness.api.push.service;

/**
 * Thin boundary around the web-push client so tests can substitute a mock
 * instead of hitting real push services.
 */
public interface PushSender {

	PushSendOutcome send(String endpoint, String p256dh, String auth, String payloadJson) throws Exception;
}
