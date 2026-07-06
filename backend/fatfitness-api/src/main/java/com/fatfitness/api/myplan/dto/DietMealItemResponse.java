package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record DietMealItemResponse(
		UUID id,
		UUID foodId,
		String name,
		String unitLabel,
		BigDecimal quantity,
		BigDecimal caloriesPerUnit,
		BigDecimal proteinPerUnit,
		BigDecimal carbsPerUnit,
		BigDecimal fatPerUnit) {
}
