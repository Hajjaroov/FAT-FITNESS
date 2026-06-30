package com.fatfitness.api.messaging.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.messaging.entity.Conversation;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
}
