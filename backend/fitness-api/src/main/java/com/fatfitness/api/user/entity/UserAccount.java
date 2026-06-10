package com.fatfitness.api.user.entity;

import java.time.Instant;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class UserAccount {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@Column(nullable = false, length = 320, unique = true)
	private String email;

	@Column(name = "display_name", nullable = false, length = 80)
	private String displayName;

	@Column(name = "country_region_code", nullable = false, length = 16)
	private String countryRegionCode;

	@Column(name = "password_hash", nullable = false)
	private String passwordHash;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private UserStatus status = UserStatus.PENDING_EMAIL_VERIFICATION;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false, length = 40)
	private Set<UserRole> roles = new HashSet<>();

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@Column(name = "email_verified_at")
	private Instant emailVerifiedAt;

	@Column(name = "last_login_at")
	private Instant lastLoginAt;

	@Column(name = "deleted_at")
	private Instant deletedAt;

	protected UserAccount() {
	}

	public UserAccount(String email, String displayName, String countryRegionCode, String passwordHash) {
		this.email = normalizeEmail(email);
		this.displayName = displayName;
		this.countryRegionCode = countryRegionCode;
		this.passwordHash = passwordHash;
		this.roles.add(UserRole.USER);
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

	public void verifyEmail() {
		status = UserStatus.ACTIVE;
		emailVerifiedAt = Instant.now();
	}

	public void recordLogin() {
		lastLoginAt = Instant.now();
	}

	public void ban() {
		status = UserStatus.BANNED;
	}

	public void softDelete() {
		status = UserStatus.DELETED;
		deletedAt = Instant.now();
	}

	public void addRole(UserRole role) {
		roles.add(role);
	}

	public UUID getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

	public String getDisplayName() {
		return displayName;
	}

	public String getCountryRegionCode() {
		return countryRegionCode;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public UserStatus getStatus() {
		return status;
	}

	public Set<UserRole> getRoles() {
		return Set.copyOf(roles);
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public Instant getEmailVerifiedAt() {
		return emailVerifiedAt;
	}

	public Instant getLastLoginAt() {
		return lastLoginAt;
	}

	public Instant getDeletedAt() {
		return deletedAt;
	}

	private static String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
	}
}
