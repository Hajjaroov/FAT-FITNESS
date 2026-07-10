package com.fatfitness.api.myplan.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddWorkoutPlanDayExerciseRequest(
		UUID exerciseId,
		@NotBlank @Size(max = 160) String name,
		@Size(max = 220) String nameDe,
		@NotBlank @Size(max = 120) String sets) {
}
