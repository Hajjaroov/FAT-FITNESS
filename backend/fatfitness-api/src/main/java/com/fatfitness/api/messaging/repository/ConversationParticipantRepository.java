package com.fatfitness.api.messaging.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.messaging.entity.ConversationParticipant;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, UUID> {

	Optional<ConversationParticipant> findByConversationIdAndUserId(UUID conversationId, UUID userId);

	// user is LAZY and callers resolve the other participant's display name/avatar.
	@EntityGraph(attributePaths = {"user"})
	List<ConversationParticipant> findByConversationId(UUID conversationId);

	@EntityGraph(attributePaths = {"user"})
	List<ConversationParticipant> findByConversationIdIn(List<UUID> conversationIds);

	// conversation is LAZY and the inbox reads its subject per row.
	@EntityGraph(attributePaths = {"conversation"})
	List<ConversationParticipant> findByUserIdAndDeletedFalse(UUID userId);
}
