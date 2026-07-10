package com.fatfitness.api.myplan.entity;

import java.time.DayOfWeek;
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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "workout_plan_days")
public class WorkoutPlanDay {

	@Id
	@Column(nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, updatable = false)
	private UserAccount user;

	@Column(nullable = false, length = 120)
	private String title;

	// Null for a block that isn't pinned to a day of the week (e.g. a warm-up
	// protocol that applies to every session).
	@Enumerated(EnumType.STRING)
	@Column(length = 10)
	private DayOfWeek weekday;

	@Column(nullable = false)
	private int position;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected WorkoutPlanDay() {
	}

	public WorkoutPlanDay(UserAccount user, String title, DayOfWeek weekday, int position) {
		this.user = user;
		this.title = title;
		this.weekday = weekday;
		this.position = position;
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

	public void update(String title, DayOfWeek weekday) {
		this.title = title;
		this.weekday = weekday;
	}

	public void updatePosition(int position) {
		this.position = position;
	}

	public UUID getId() {
		return id;
	}

	public UserAccount getUser() {
		return user;
	}

	public String getTitle() {
		return title;
	}

	public DayOfWeek getWeekday() {
		return weekday;
	}

	public int getPosition() {
		return position;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
