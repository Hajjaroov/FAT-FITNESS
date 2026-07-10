package com.fatfitness.api.myplan.dto;

import java.util.UUID;

public record ExerciseResponse(
		UUID id,
		String name,
		String nameDe,
		String photoSrc) {
}
