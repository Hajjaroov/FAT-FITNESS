package com.fatfitness.api.myplan.entity;

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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "exercises")
public class Exercise {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = true)
	@JoinColumn(name = "created_by_user_id", updatable = false)
	private UserAccount createdBy;

	@Column(nullable = false, length = 160)
	private String name;

	@Column(name = "name_de", length = 220)
	private String nameDe;

	@Column(name = "photo_src", length = 300)
	private String photoSrc;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected Exercise() {
	}

	public Exercise(UserAccount createdBy, String name, String nameDe, String photoSrc) {
		this.createdBy = createdBy;
		this.name = name;
		this.nameDe = nameDe;
		this.photoSrc = photoSrc;
	}

	@PrePersist
	void beforeCreate() {
		if (id == null) {
			id = UUID.randomUUID();
		}
		Instant now = Instant.now();
		createdAt = now;
		updatedAt = now;
	}

	@PreUpdate
	void beforeUpdate() {
		updatedAt = Instant.now();
	}

	public void update(String name, String nameDe, String photoSrc) {
		this.name = name;
		this.nameDe = nameDe;
		this.photoSrc = photoSrc;
	}

	public UUID getId() {
		return id;
	}

	public UserAccount getCreatedBy() {
		return createdBy;
	}

	public String getName() {
		return name;
	}

	public String getNameDe() {
		return nameDe;
	}

	public String getPhotoSrc() {
		return photoSrc;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
