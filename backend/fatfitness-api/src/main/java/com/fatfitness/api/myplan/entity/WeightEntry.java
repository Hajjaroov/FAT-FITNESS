package com.fatfitness.api.myplan.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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
@Table(name = "weight_entries")
public class WeightEntry {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAccount user;

	@Column(name = "entry_date", nullable = false, updatable = false)
	private LocalDate entryDate;

	@Column(name = "weight_kg", nullable = false, precision = 6, scale = 2)
	private BigDecimal weightKg;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	protected WeightEntry() {
	}

	public WeightEntry(UserAccount user, LocalDate entryDate, BigDecimal weightKg) {
		this.user = user;
		this.entryDate = entryDate;
		this.weightKg = weightKg;
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

	public LocalDate getEntryDate() {
		return entryDate;
	}

	public BigDecimal getWeightKg() {
		return weightKg;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
