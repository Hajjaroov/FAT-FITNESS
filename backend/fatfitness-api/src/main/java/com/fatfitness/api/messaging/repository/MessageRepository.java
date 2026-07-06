package com.fatfitness.api.messaging.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.messaging.entity.Message;

public interface MessageRepository extends JpaRepository<Message, UUID> {

	List<Message> findByConversationIdOrderBySentAtAsc(UUID conversationId);

	Optional<Message> findTopByConversationIdOrderBySentAtDesc(UUID conversationId);

	// Ordered by conversation then newest-first within each conversation, so the
	// first row seen per conversation id is its latest message - callers reduce
	// this into a per-conversation map instead of querying once per conversation.
	List<Message> findByConversationIdInOrderByConversationIdAscSentAtDesc(List<UUID> conversationIds);
}
