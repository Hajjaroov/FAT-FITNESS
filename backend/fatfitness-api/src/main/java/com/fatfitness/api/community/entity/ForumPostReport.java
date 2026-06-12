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
import jakarta.persistence.Table;

@Entity
@Table(name = "forum_post_reports")
public class ForumPostReport {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "post_id", nullable = false)
	private ForumPost post;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "reporter_user_id", nullable = false)
	private UserAccount reporter;

	@Column(nullable = false, length = 80)
	private String reason;

	@Column(length = 1000)
	private String details;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private ForumReportStatus status = ForumReportStatus.OPEN;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "resolved_at")
	private Instant resolvedAt;

	protected ForumPostReport() {
	}

	public ForumPostReport(ForumPost post, UserAccount reporter, String reason, String details) {
		this.post = post;
		this.reporter = reporter;
		this.reason = reason;
		this.details = details;
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

	public ForumPost getPost() {
		return post;
	}

	public UserAccount getReporter() {
		return reporter;
	}

	public String getReason() {
		return reason;
	}

	public String getDetails() {
		return details;
	}

	public ForumReportStatus getStatus() {
		return status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getResolvedAt() {
		return resolvedAt;
	}
}
