package com.fatfitness.api.messaging.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.messaging.entity.Message;

public interface MessageRepository extends JpaRepository<Message, UUID> {

	List<Message> findByConversationIdOrderBySentAtAsc(UUID conversationId);

	Optional<Message> findTopByConversationIdOrderBySentAtDesc(UUID conversationId);
}
