package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record FoodResponse(
		UUID id,
		String name,
		String nameDe,
		String unitLabel,
		BigDecimal caloriesPerUnit,
		BigDecimal proteinPerUnit,
		BigDecimal carbsPerUnit,
		BigDecimal fatPerUnit) {
}
