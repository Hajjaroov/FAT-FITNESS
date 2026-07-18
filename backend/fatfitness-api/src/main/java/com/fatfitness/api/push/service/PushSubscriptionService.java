package com.fatfitness.api.push.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.push.dto.SubscribePushRequest;
import com.fatfitness.api.push.dto.UnsubscribePushRequest;
import com.fatfitness.api.push.entity.PushSubscription;
import com.fatfitness.api.push.repository.PushSubscriptionRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Service
public class PushSubscriptionService {

	private final PushSubscriptionRepository pushSubscriptionRepository;
	private final UserAccountRepository userAccountRepository;

	public PushSubscriptionService(
			PushSubscriptionRepository pushSubscriptionRepository,
			UserAccountRepository userAccountRepository) {
		this.pushSubscriptionRepository = pushSubscriptionRepository;
		this.userAccountRepository = userAccountRepository;
	}

	@Transactional
	public void subscribe(SubscribePushRequest request, String userIdSubject, String userAgent) {
		UserAccount user = requireActiveUser(userIdSubject);

		// Upsert by endpoint: re-subscribing the same browser replaces its row, and an
		// endpoint that moved to another user (shared device, different account) is
		// reassigned rather than duplicated — endpoint is unique per browser install.
		PushSubscription subscription = pushSubscriptionRepository.findByEndpoint(request.endpoint())
				.orElseGet(() -> new PushSubscription(user, request.endpoint(), request.p256dh(), request.auth(), userAgent));
		subscription.reassign(user, request.p256dh(), request.auth(), userAgent);
		pushSubscriptionRepository.save(subscription);
	}

	@Transactional
	public void unsubscribe(UnsubscribePushRequest request, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		pushSubscriptionRepository.deleteByEndpointAndUserId(request.endpoint(), user.getId());
	}

	private UserAccount requireActiveUser(String userIdSubject) {
		UserAccount user = userAccountRepository.findById(parseUserId(userIdSubject))
				.orElseThrow(PushSubscriptionService::invalidToken);
		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}
		return user;
	}

	private static UUID parseUserId(String subject) {
		try {
			return UUID.fromString(subject);
		}
		catch (RuntimeException ex) {
			throw invalidToken();
		}
	}

	private static ResponseStatusException invalidToken() {
		return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid access token");
	}
}
