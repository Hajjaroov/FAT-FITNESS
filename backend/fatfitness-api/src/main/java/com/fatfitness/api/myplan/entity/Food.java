package com.fatfitness.api.myplan.entity;

import java.math.BigDecimal;
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
@Table(name = "foods")
public class Food {

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

	@Column(name = "unit_label", nullable = false, length = 60)
	private String unitLabel;

	@Column(name = "calories_per_unit", nullable = false, precision = 7, scale = 2)
	private BigDecimal caloriesPerUnit;

	@Column(name = "protein_per_unit", nullable = false, precision = 6, scale = 2)
	private BigDecimal proteinPerUnit;

	@Column(name = "carbs_per_unit", nullable = false, precision = 6, scale = 2)
	private BigDecimal carbsPerUnit;

	@Column(name = "fat_per_unit", nullable = false, precision = 6, scale = 2)
	private BigDecimal fatPerUnit;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected Food() {
	}

	public Food(
			UserAccount createdBy,
			String name,
			String nameDe,
			String unitLabel,
			BigDecimal caloriesPerUnit,
			BigDecimal proteinPerUnit,
			BigDecimal carbsPerUnit,
			BigDecimal fatPerUnit) {
		this.createdBy = createdBy;
		this.name = name;
		this.nameDe = nameDe;
		this.unitLabel = unitLabel;
		this.caloriesPerUnit = caloriesPerUnit;
		this.proteinPerUnit = proteinPerUnit;
		this.carbsPerUnit = carbsPerUnit;
		this.fatPerUnit = fatPerUnit;
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

	public void update(
			String name,
			String nameDe,
			String unitLabel,
			BigDecimal caloriesPerUnit,
			BigDecimal proteinPerUnit,
			BigDecimal carbsPerUnit,
			BigDecimal fatPerUnit) {
		this.name = name;
		this.nameDe = nameDe;
		this.unitLabel = unitLabel;
		this.caloriesPerUnit = caloriesPerUnit;
		this.proteinPerUnit = proteinPerUnit;
		this.carbsPerUnit = carbsPerUnit;
		this.fatPerUnit = fatPerUnit;
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

	public String getUnitLabel() {
		return unitLabel;
	}

	public BigDecimal getCaloriesPerUnit() {
		return caloriesPerUnit;
	}

	public BigDecimal getProteinPerUnit() {
		return proteinPerUnit;
	}

	public BigDecimal getCarbsPerUnit() {
		return carbsPerUnit;
	}

	public BigDecimal getFatPerUnit() {
		return fatPerUnit;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
