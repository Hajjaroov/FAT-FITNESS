package com.fatfitness.api.myplan.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

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
@Table(name = "diet_meal_items")
public class DietMealItem {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "meal_id", nullable = false, updatable = false)
	private DietMeal meal;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "food_id")
	private Food food;

	@Column(nullable = false, length = 120)
	private String name;

	@Column(name = "unit_label", length = 60)
	private String unitLabel;

	@Column(nullable = false, precision = 6, scale = 2)
	private BigDecimal quantity;

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

	protected DietMealItem() {
	}

	public DietMealItem(
			DietMeal meal,
			Food food,
			String name,
			String unitLabel,
			BigDecimal quantity,
			BigDecimal caloriesPerUnit,
			BigDecimal proteinPerUnit,
			BigDecimal carbsPerUnit,
			BigDecimal fatPerUnit) {
		this.meal = meal;
		this.food = food;
		this.name = name;
		this.unitLabel = unitLabel;
		this.quantity = quantity;
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

	public void clearFood() {
		this.food = null;
	}

	public void update(
			String name,
			String unitLabel,
			BigDecimal quantity,
			BigDecimal caloriesPerUnit,
			BigDecimal proteinPerUnit,
			BigDecimal carbsPerUnit,
			BigDecimal fatPerUnit) {
		this.name = name;
		this.unitLabel = unitLabel;
		this.quantity = quantity;
		this.caloriesPerUnit = caloriesPerUnit;
		this.proteinPerUnit = proteinPerUnit;
		this.carbsPerUnit = carbsPerUnit;
		this.fatPerUnit = fatPerUnit;
	}

	public UUID getId() {
		return id;
	}

	public DietMeal getMeal() {
		return meal;
	}

	public Food getFood() {
		return food;
	}

	public String getName() {
		return name;
	}

	public String getUnitLabel() {
		return unitLabel;
	}

	public BigDecimal getQuantity() {
		return quantity;
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
