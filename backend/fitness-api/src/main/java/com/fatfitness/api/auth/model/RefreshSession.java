package com.fatfitness.api.auth.model;

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
@Table(name = "refresh_sessions")
public class RefreshSession {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAccount user;

	@Column(name = "refresh_token_hash", nullable = false, unique = true)
	private String refreshTokenHash;

	@Enumerated(EnumType.STRING)
	@Column(name = "client_type", nullable = false, length = 32)
	private ClientType clientType;

	@Column(name = "device_label", length = 120)
	private String deviceLabel;

	@Column(name = "user_agent", length = 512)
	private String userAgent;

	@Column(name = "ip_address", length = 45)
	private String ipAddress;

	@Column(name = "expires_at", nullable = false)
	private Instant expiresAt;

	@Column(name = "revoked_at")
	private Instant revokedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "replaced_by_session_id")
	private RefreshSession replacedBySession;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@Column(name = "last_used_at")
	private Instant lastUsedAt;

	protected RefreshSession() {
	}

	public RefreshSession(UserAccount user, String refreshTokenHash, ClientType clientType, Instant expiresAt) {
		this.user = user;
		this.refreshTokenHash = refreshTokenHash;
		this.clientType = clientType;
		this.expiresAt = expiresAt;
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

	public void recordUse() {
		lastUsedAt = Instant.now();
	}

	public void revoke() {
		revokedAt = Instant.now();
	}

	public void replaceWith(RefreshSession replacement) {
		replacedBySession = replacement;
		revoke();
	}

	public void setClientMetadata(String deviceLabel, String userAgent, String ipAddress) {
		this.deviceLabel = deviceLabel;
		this.userAgent = userAgent;
		this.ipAddress = ipAddress;
	}

	public UUID getId() {
		return id;
	}

	public UserAccount getUser() {
		return user;
	}

	public String getRefreshTokenHash() {
		return refreshTokenHash;
	}

	public ClientType getClientType() {
		return clientType;
	}

	public String getDeviceLabel() {
		return deviceLabel;
	}

	public String getUserAgent() {
		return userAgent;
	}

	public String getIpAddress() {
		return ipAddress;
	}

	public Instant getExpiresAt() {
		return expiresAt;
	}

	public Instant getRevokedAt() {
		return revokedAt;
	}

	public RefreshSession getReplacedBySession() {
		return replacedBySession;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public Instant getLastUsedAt() {
		return lastUsedAt;
	}
}
