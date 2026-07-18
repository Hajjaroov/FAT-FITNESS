package com.fatfitness.api.push.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.push.entity.PushSubscription;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, UUID> {

	Optional<PushSubscription> findByEndpoint(String endpoint);

	List<PushSubscription> findByUserId(UUID userId);

	void deleteByEndpointAndUserId(String endpoint, UUID userId);

	// Explicit @Transactional: called from PushNotificationService's dedicated
	// executor thread, which has no ambient transaction of its own to inherit.
	@Transactional
	void deleteByEndpoint(String endpoint);
}
