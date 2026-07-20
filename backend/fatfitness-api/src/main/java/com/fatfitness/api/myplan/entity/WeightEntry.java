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

	// Set only when this row is created as a byproduct of logging a GLP-1 entry
	// with a weight attached. ON DELETE CASCADE (see V19) means deleting that
	// medication entry removes this row too - but only for rows this column
	// actually links, never a weight entry that already existed independently
	// or was added on its own. Never set retroactively on an update.
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "source_medication_entry_id")
	private MedicationLogEntry sourceMedicationEntry;

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

	public void updateWeightKg(BigDecimal weightKg) {
		this.weightKg = weightKg;
	}

	public void linkToMedicationEntry(MedicationLogEntry sourceMedicationEntry) {
		this.sourceMedicationEntry = sourceMedicationEntry;
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

	public MedicationLogEntry getSourceMedicationEntry() {
		return sourceMedicationEntry;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
