package com.fatfitness.api.community.entity;

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
@Table(name = "post_likes")
public class PostLike {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAccount user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "post_id", nullable = false)
	private ForumPost post;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	protected PostLike() {
	}

	public PostLike(UserAccount user, ForumPost post) {
		this.user = user;
		this.post = post;
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

	public UserAccount getUser() {
		return user;
	}

	public ForumPost getPost() {
		return post;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
