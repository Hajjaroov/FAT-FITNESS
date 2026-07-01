package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record UpdateWeightGoalsRequest(
		@NotNull @DecimalMin("1") BigDecimal startWeight,
		@NotNull @DecimalMin("1") BigDecimal goalWeight) {
}
