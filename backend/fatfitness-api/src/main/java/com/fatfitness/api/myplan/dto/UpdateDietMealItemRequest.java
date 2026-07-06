package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateDietMealItemRequest(
		@NotBlank @Size(max = 120) String name,
		@Size(max = 60) String unitLabel,
		@NotNull @DecimalMin("0.01") @DecimalMax("9999.99") BigDecimal quantity,
		@NotNull @DecimalMin("0") @DecimalMax("99999.99") BigDecimal caloriesPerUnit,
		@NotNull @DecimalMin("0") @DecimalMax("9999.99") BigDecimal proteinPerUnit,
		@NotNull @DecimalMin("0") @DecimalMax("9999.99") BigDecimal carbsPerUnit,
		@NotNull @DecimalMin("0") @DecimalMax("9999.99") BigDecimal fatPerUnit) {
}
