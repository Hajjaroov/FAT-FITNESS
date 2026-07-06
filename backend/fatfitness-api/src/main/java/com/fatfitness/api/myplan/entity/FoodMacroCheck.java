package com.fatfitness.api.myplan.entity;

import java.math.BigDecimal;
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
@Table(name = "food_macro_checks")
public class FoodMacroCheck {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "target_food_id", nullable = false, updatable = false)
	private Food targetFood;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "submitted_by_user_id", nullable = false, updatable = false)
	private UserAccount submittedBy;

	@Column(name = "proposed_name", length = 120)
	private String proposedName;

	@Column(name = "proposed_unit_label", length = 60)
	private String proposedUnitLabel;

	@Column(name = "proposed_calories_per_unit", nullable = false, precision = 7, scale = 2)
	private BigDecimal proposedCaloriesPerUnit;

	@Column(name = "proposed_protein_per_unit", nullable = false, precision = 6, scale = 2)
	private BigDecimal proposedProteinPerUnit;

	@Column(name = "proposed_carbs_per_unit", nullable = false, precision = 6, scale = 2)
	private BigDecimal proposedCarbsPerUnit;

	@Column(name = "proposed_fat_per_unit", nullable = false, precision = 6, scale = 2)
	private BigDecimal proposedFatPerUnit;

	@Column(length = 1000)
	private String comment;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private FoodMacroCheckStatus status = FoodMacroCheckStatus.OPEN;

	// Mirrors submittedBy's id while OPEN, cleared on close(); backs the
	// "one open flag per user per food" unique constraint (see V14 migration).
	@Column(name = "open_submitted_by_user_id")
	private UUID openSubmittedByUserId;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "resolved_at")
	private Instant resolvedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "resolved_by_user_id")
	private UserAccount resolvedBy;

	@Column(name = "resolution_note", length = 1000)
	private String resolutionNote;

	protected FoodMacroCheck() {
	}

	public FoodMacroCheck(
			Food targetFood,
			UserAccount submittedBy,
			String proposedName,
			String proposedUnitLabel,
			BigDecimal proposedCaloriesPerUnit,
			BigDecimal proposedProteinPerUnit,
			BigDecimal proposedCarbsPerUnit,
			BigDecimal proposedFatPerUnit,
			String comment) {
		this.targetFood = targetFood;
		this.submittedBy = submittedBy;
		this.openSubmittedByUserId = submittedBy.getId();
		this.proposedName = proposedName;
		this.proposedUnitLabel = proposedUnitLabel;
		this.proposedCaloriesPerUnit = proposedCaloriesPerUnit;
		this.proposedProteinPerUnit = proposedProteinPerUnit;
		this.proposedCarbsPerUnit = proposedCarbsPerUnit;
		this.proposedFatPerUnit = proposedFatPerUnit;
		this.comment = comment;
	}

	@PrePersist
	void beforeCreate() {
		if (id == null) {
			id = UUID.randomUUID();
		}
		createdAt = Instant.now();
	}

	public void close(FoodMacroCheckStatus status, UserAccount resolvedBy, String resolutionNote) {
		this.status = status;
		this.resolvedBy = resolvedBy;
		this.resolutionNote = resolutionNote;
		this.openSubmittedByUserId = null;
		resolvedAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public Food getTargetFood() {
		return targetFood;
	}

	public UserAccount getSubmittedBy() {
		return submittedBy;
	}

	public String getProposedName() {
		return proposedName;
	}

	public String getProposedUnitLabel() {
		return proposedUnitLabel;
	}

	public BigDecimal getProposedCaloriesPerUnit() {
		return proposedCaloriesPerUnit;
	}

	public BigDecimal getProposedProteinPerUnit() {
		return proposedProteinPerUnit;
	}

	public BigDecimal getProposedCarbsPerUnit() {
		return proposedCarbsPerUnit;
	}

	public BigDecimal getProposedFatPerUnit() {
		return proposedFatPerUnit;
	}

	public String getComment() {
		return comment;
	}

	public FoodMacroCheckStatus getStatus() {
		return status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getResolvedAt() {
		return resolvedAt;
	}

	public UserAccount getResolvedBy() {
		return resolvedBy;
	}

	public String getResolutionNote() {
		return resolutionNote;
	}
}
