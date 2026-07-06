package com.fatfitness.api.myplan.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DietMealResponse(
		UUID id,
		String title,
		int position,
		List<DietMealItemResponse> items,
		Instant updatedAt) {
}
