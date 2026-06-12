package com.fatfitness.api.community.entity;

import java.time.Instant;
import java.util.UUID;

import com.fatfitness.api.user.entity.UserAccount;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "forum_comments")
public class ForumComment {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "post_id", nullable = false)
	private ForumPost post;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "author_user_id", nullable = false)
	private UserAccount author;

	@Column(nullable = false, columnDefinition = "text")
	private String body;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private ForumCommentStatus status = ForumCommentStatus.PUBLISHED;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@Column(name = "hidden_at")
	private Instant hiddenAt;

	@Column(name = "deleted_at")
	private Instant deletedAt;

	protected ForumComment() {
	}

	public ForumComment(ForumPost post, UserAccount author, String body) {
		this.post = post;
		this.author = author;
		this.body = body;
	}

	@PrePersist
	void beforeCreate() {
		Instant now = Instant.now();

		if (id == null) {
			id = UUID.randomUUID();
		}

		createdAt = now;
		updatedAt = now;
	}

	@PreUpdate
	void beforeUpdate() {
		updatedAt = Instant.now();
	}

	public void hide() {
		status = ForumCommentStatus.HIDDEN;
		hiddenAt = Instant.now();
	}

	public void softDelete() {
		status = ForumCommentStatus.DELETED;
		deletedAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public ForumPost getPost() {
		return post;
	}

	public UserAccount getAuthor() {
		return author;
	}

	public String getBody() {
		return body;
	}

	public ForumCommentStatus getStatus() {
		return status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public Instant getHiddenAt() {
		return hiddenAt;
	}

	public Instant getDeletedAt() {
		return deletedAt;
	}
}
