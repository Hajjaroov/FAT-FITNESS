package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record UpdateWeightEntryRequest(
		@NotNull @DecimalMin("1") @DecimalMax("9999.99") BigDecimal weightKg) {
}
