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
@Table(name = "forum_posts")
public class ForumPost {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "category_id", nullable = false)
	private ForumCategory category;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "author_user_id", nullable = false)
	private UserAccount author;

	@Column(nullable = false, length = 160)
	private String title;

	@Column(nullable = false, columnDefinition = "text")
	private String body;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private ForumPostStatus status = ForumPostStatus.PUBLISHED;

	@Column(name = "is_locked", nullable = false)
	private boolean locked;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@Column(name = "hidden_at")
	private Instant hiddenAt;

	@Column(name = "deleted_at")
	private Instant deletedAt;

	@Column(name = "locked_at")
	private Instant lockedAt;

	protected ForumPost() {
	}

	public ForumPost(ForumCategory category, UserAccount author, String title, String body) {
		this.category = category;
		this.author = author;
		this.title = title;
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
		status = ForumPostStatus.HIDDEN;
		hiddenAt = Instant.now();
	}

	public void softDelete() {
		status = ForumPostStatus.DELETED;
		deletedAt = Instant.now();
	}

	public void lock() {
		locked = true;
		lockedAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public ForumCategory getCategory() {
		return category;
	}

	public UserAccount getAuthor() {
		return author;
	}

	public String getTitle() {
		return title;
	}

	public String getBody() {
		return body;
	}

	public ForumPostStatus getStatus() {
		return status;
	}

	public boolean isLocked() {
		return locked;
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

	public Instant getLockedAt() {
		return lockedAt;
	}
}
