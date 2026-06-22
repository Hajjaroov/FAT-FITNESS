package com.fatfitness.api.moderation.entity;

import java.time.Instant;
import java.util.UUID;

import com.fatfitness.api.user.entity.UserAccount;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "moderation_actions")
public class ModerationAction {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "moderator_user_id", nullable = false)
	private UserAccount moderator;

	@Column(name = "target_type", nullable = false, length = 20)
	private String targetType;

	@Column(name = "target_id", nullable = false)
	private UUID targetId;

	@Column(name = "action", nullable = false, length = 40)
	private String action;

	@Column(name = "note", length = 1000)
	private String note;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected ModerationAction() {
	}

	private ModerationAction(UserAccount moderator, String targetType, UUID targetId, String action, String note) {
		this.id = UUID.randomUUID();
		this.moderator = moderator;
		this.targetType = targetType;
		this.targetId = targetId;
		this.action = action;
		this.note = note;
		this.createdAt = Instant.now();
	}

	public static ModerationAction lock(UserAccount moderator, UUID postId, String note) {
		return new ModerationAction(moderator, "POST", postId, "LOCK", note);
	}

	public static ModerationAction ban(UserAccount moderator, UUID userId, String note) {
		return new ModerationAction(moderator, "USER", userId, "BAN", note);
	}

	public UUID getId() { return id; }
	public UserAccount getModerator() { return moderator; }
	public String getTargetType() { return targetType; }
	public UUID getTargetId() { return targetId; }
	public String getAction() { return action; }
	public String getNote() { return note; }
	public Instant getCreatedAt() { return createdAt; }
}
