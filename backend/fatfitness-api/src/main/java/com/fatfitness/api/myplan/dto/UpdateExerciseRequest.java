package com.fatfitness.api.myplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateExerciseRequest(
		@NotBlank @Size(max = 160) String name,
		@Size(max = 220) String nameDe,
		@Size(max = 300) String photoSrc) {
}
