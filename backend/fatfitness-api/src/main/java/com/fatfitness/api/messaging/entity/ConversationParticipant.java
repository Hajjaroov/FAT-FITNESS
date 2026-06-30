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
@Table(name = "conversation_participants")
public class ConversationParticipant {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "conversation_id", nullable = false)
	private Conversation conversation;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAccount user;

	@Column(name = "last_read_at")
	private Instant lastReadAt;

	@Column(nullable = false)
	private boolean deleted;

	protected ConversationParticipant() {
	}

	public ConversationParticipant(Conversation conversation, UserAccount user, Instant lastReadAt) {
		this.conversation = conversation;
		this.user = user;
		this.lastReadAt = lastReadAt;
	}

	@PrePersist
	void beforeCreate() {
		if (id == null) {
			id = UUID.randomUUID();
		}
	}

	public void markRead() {
		this.lastReadAt = Instant.now();
	}

	public void markUnread() {
		this.lastReadAt = null;
	}

	public void softDelete() {
		this.deleted = true;
	}

	public void restore() {
		this.deleted = false;
	}

	public UUID getId() {
		return id;
	}

	public Conversation getConversation() {
		return conversation;
	}

	public UserAccount getUser() {
		return user;
	}

	public Instant getLastReadAt() {
		return lastReadAt;
	}

	public boolean isDeleted() {
		return deleted;
	}
}
