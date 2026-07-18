package com.fatfitness.api.messaging.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fatfitness.api.messaging.entity.Message;

public interface MessageRepository extends JpaRepository<Message, UUID> {

	// sender is LAZY and the thread mapping resolves each sender's name/avatar.
	@EntityGraph(attributePaths = {"sender"})
	List<Message> findByConversationIdOrderBySentAtAsc(UUID conversationId);

	Optional<Message> findTopByConversationIdOrderBySentAtDesc(UUID conversationId);

	// One row per conversation (its newest message) straight from Postgres, instead
	// of loading every message of every conversation and reducing in Java.
	@Query(value = "select distinct on (conversation_id) * from messages"
			+ " where conversation_id in (:conversationIds)"
			+ " order by conversation_id, sent_at desc", nativeQuery = true)
	List<Message> findLatestPerConversation(@Param("conversationIds") List<UUID> conversationIds);
}
