package com.fatfitness.api.messaging.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.messaging.entity.ConversationParticipant;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, UUID> {

	Optional<ConversationParticipant> findByConversationIdAndUserId(UUID conversationId, UUID userId);

	List<ConversationParticipant> findByConversationId(UUID conversationId);

	List<ConversationParticipant> findByConversationIdIn(List<UUID> conversationIds);

	List<ConversationParticipant> findByUserIdAndDeletedFalse(UUID userId);
}
