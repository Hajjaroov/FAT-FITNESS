package com.fatfitness.api.user.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Avatar image bytes, kept out of {@link UserAccount} on purpose: user entities are
 * loaded on every post/comment/message mapping, and the blob must not ride along.
 * Only the avatar endpoint and upload path touch this table.
 */
@Entity
@Table(name = "user_avatars")
public class UserAvatar {

	@Id
	@Column(name = "user_id", nullable = false, updatable = false)
	private UUID userId;

	@Column(name = "avatar_jpeg", nullable = false)
	private byte[] avatarJpeg;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected UserAvatar() {
	}

	public UserAvatar(UUID userId, byte[] avatarJpeg) {
		this.userId = userId;
		this.avatarJpeg = avatarJpeg;
		this.updatedAt = Instant.now();
	}

	public void updateImage(byte[] newAvatarJpeg) {
		this.avatarJpeg = newAvatarJpeg;
		this.updatedAt = Instant.now();
	}

	public UUID getUserId() {
		return userId;
	}

	public byte[] getAvatarJpeg() {
		return avatarJpeg;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
