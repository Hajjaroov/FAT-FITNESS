package com.fatfitness.api.messaging.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "conversations")
public class Conversation {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@Column(nullable = false, length = 160)
	private String subject;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	protected Conversation() {
	}

	public Conversation(String subject) {
		this.subject = subject;
	}

	@PrePersist
	void beforeCreate() {
		if (id == null) {
			id = UUID.randomUUID();
		}
		createdAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public String getSubject() {
		return subject;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
