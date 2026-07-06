package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResolveFoodMacroCheckRequest(
		@NotBlank String action,
		@Size(max = 160) String finalName,
		@Size(max = 220) String finalNameDe,
		@Size(max = 60) String finalUnitLabel,
		@DecimalMin("0") @DecimalMax("99999.99") BigDecimal finalCaloriesPerUnit,
		@DecimalMin("0") @DecimalMax("9999.99") BigDecimal finalProteinPerUnit,
		@DecimalMin("0") @DecimalMax("9999.99") BigDecimal finalCarbsPerUnit,
		@DecimalMin("0") @DecimalMax("9999.99") BigDecimal finalFatPerUnit,
		@Size(max = 1000) String resolutionNote) {
}
