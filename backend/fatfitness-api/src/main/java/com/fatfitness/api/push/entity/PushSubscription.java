package com.fatfitness.api.push.entity;

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
@Table(name = "push_subscriptions")
public class PushSubscription {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAccount user;

	@Column(nullable = false, unique = true)
	private String endpoint;

	@Column(nullable = false, length = 255)
	private String p256dh;

	@Column(nullable = false, length = 255)
	private String auth;

	@Column(name = "user_agent", length = 512)
	private String userAgent;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	protected PushSubscription() {
	}

	public PushSubscription(UserAccount user, String endpoint, String p256dh, String auth, String userAgent) {
		this.user = user;
		this.endpoint = endpoint;
		this.p256dh = p256dh;
		this.auth = auth;
		this.userAgent = userAgent;
	}

	@PrePersist
	void beforeCreate() {
		if (id == null) {
			id = UUID.randomUUID();
		}
		createdAt = Instant.now();
	}

	public void reassign(UserAccount user, String p256dh, String auth, String userAgent) {
		this.user = user;
		this.p256dh = p256dh;
		this.auth = auth;
		this.userAgent = userAgent;
	}

	public UUID getId() {
		return id;
	}

	public UserAccount getUser() {
		return user;
	}

	public String getEndpoint() {
		return endpoint;
	}

	public String getP256dh() {
		return p256dh;
	}

	public String getAuth() {
		return auth;
	}

	public String getUserAgent() {
		return userAgent;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
