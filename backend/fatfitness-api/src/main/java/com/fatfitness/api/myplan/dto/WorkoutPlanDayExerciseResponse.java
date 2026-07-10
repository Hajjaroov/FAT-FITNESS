package com.fatfitness.api.myplan.dto;

import java.util.UUID;

public record WorkoutPlanDayExerciseResponse(
		UUID id,
		UUID exerciseId,
		String name,
		String sets) {
}
