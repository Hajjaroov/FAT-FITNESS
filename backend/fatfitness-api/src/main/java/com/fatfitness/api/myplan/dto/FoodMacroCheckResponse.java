package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.fatfitness.api.myplan.entity.FoodMacroCheckStatus;

public record FoodMacroCheckResponse(
		UUID id,
		FoodResponse targetFood,
		String proposedName,
		String proposedUnitLabel,
		BigDecimal proposedCaloriesPerUnit,
		BigDecimal proposedProteinPerUnit,
		BigDecimal proposedCarbsPerUnit,
		BigDecimal proposedFatPerUnit,
		String comment,
		String submittedByDisplayName,
		FoodMacroCheckStatus status,
		Instant createdAt) {
}
