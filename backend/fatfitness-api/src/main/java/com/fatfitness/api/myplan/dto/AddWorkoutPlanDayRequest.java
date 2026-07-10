package com.fatfitness.api.myplan.dto;

import java.time.DayOfWeek;

import jakarta.validation.constraints.Size;

public record AddWorkoutPlanDayRequest(
		@Size(max = 120) String title,
		DayOfWeek weekday) {
}
