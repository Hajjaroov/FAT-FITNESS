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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "medication_log_entries")
public class MedicationLogEntry {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, updatable = false)
	private UserAccount user;

	@Column(name = "entry_date", nullable = false)
	private LocalDate entryDate;

	@Column(name = "dose_mg", nullable = false, precision = 6, scale = 2)
	private BigDecimal doseMg;

	@Column(length = 1000)
	private String notes;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected MedicationLogEntry() {
	}

	public MedicationLogEntry(UserAccount user, LocalDate entryDate, BigDecimal doseMg, String notes) {
		this.user = user;
		this.entryDate = entryDate;
		this.doseMg = doseMg;
		this.notes = notes;
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

	public void update(LocalDate entryDate, BigDecimal doseMg, String notes) {
		this.entryDate = entryDate;
		this.doseMg = doseMg;
		this.notes = notes;
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

	public BigDecimal getDoseMg() {
		return doseMg;
	}

	public String getNotes() {
		return notes;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
