package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record WeightGoalResponse(
		BigDecimal startWeight,
		BigDecimal goalWeight,
		Instant updatedAt) {
}
