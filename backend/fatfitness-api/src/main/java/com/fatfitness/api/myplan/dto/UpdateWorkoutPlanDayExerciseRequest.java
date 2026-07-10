package com.fatfitness.api.myplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateWorkoutPlanDayExerciseRequest(
		@NotBlank @Size(max = 160) String name,
		@NotBlank @Size(max = 120) String sets) {
}
