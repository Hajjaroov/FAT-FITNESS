package com.fatfitness.api.myplan.dto;

import java.time.DayOfWeek;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record WorkoutPlanDayResponse(
		UUID id,
		String title,
		DayOfWeek weekday,
		int position,
		List<WorkoutPlanDayExerciseResponse> exercises,
		Instant updatedAt) {
}
