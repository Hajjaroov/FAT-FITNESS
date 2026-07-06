package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddFoodMacroCheckRequest(
		@NotNull UUID targetFoodId,
		@Size(max = 120) String proposedName,
		@Size(max = 60) String proposedUnitLabel,
		@NotNull @DecimalMin("0") @DecimalMax("99999.99") BigDecimal proposedCaloriesPerUnit,
		@NotNull @DecimalMin("0") @DecimalMax("9999.99") BigDecimal proposedProteinPerUnit,
		@NotNull @DecimalMin("0") @DecimalMax("9999.99") BigDecimal proposedCarbsPerUnit,
		@NotNull @DecimalMin("0") @DecimalMax("9999.99") BigDecimal proposedFatPerUnit,
		@Size(max = 1000) String comment) {
}
