package com.fatfitness.api.myplan.entity;

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
@Table(name = "workout_plan_day_exercises")
public class WorkoutPlanDayExercise {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "plan_day_id", nullable = false, updatable = false)
	private WorkoutPlanDay planDay;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "exercise_id")
	private Exercise exercise;

	@Column(nullable = false, length = 160)
	private String name;

	// Free text, same shape as the Journal training pages: "3 x 8-10",
	// "2 minutes", "2 x 12-15 each side".
	@Column(nullable = false, length = 120)
	private String sets;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected WorkoutPlanDayExercise() {
	}

	public WorkoutPlanDayExercise(WorkoutPlanDay planDay, Exercise exercise, String name, String sets) {
		this.planDay = planDay;
		this.exercise = exercise;
		this.name = name;
		this.sets = sets;
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

	public void clearExercise() {
		this.exercise = null;
	}

	public void update(String name, String sets) {
		this.name = name;
		this.sets = sets;
	}

	public UUID getId() {
		return id;
	}

	public WorkoutPlanDay getPlanDay() {
		return planDay;
	}

	public Exercise getExercise() {
		return exercise;
	}

	public String getName() {
		return name;
	}

	public String getSets() {
		return sets;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
