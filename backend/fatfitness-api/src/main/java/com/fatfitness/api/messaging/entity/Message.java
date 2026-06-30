package com.fatfitness.api.messaging.entity;

import java.time.Instant;
import java.util.UUID;

import com.fatfitness.api.user.entity.UserAccount;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "messages")
public class Message {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "conversation_id", nullable = false)
	private Conversation conversation;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sender_user_id", nullable = false)
	private UserAccount sender;

	@Column(nullable = false, columnDefinition = "text")
	private String body;

	@Column(name = "sent_at", nullable = false, updatable = false)
	private Instant sentAt;

	protected Message() {
	}

	public Message(Conversation conversation, UserAccount sender, String body) {
		this.conversation = conversation;
		this.sender = sender;
		this.body = body;
	}

	@PrePersist
	void beforeCreate() {
		if (id == null) {
			id = UUID.randomUUID();
		}
		sentAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public Conversation getConversation() {
		return conversation;
	}

	public UserAccount getSender() {
		return sender;
	}

	public String getBody() {
		return body;
	}

	public Instant getSentAt() {
		return sentAt;
	}
}
