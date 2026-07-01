package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record AddWeightEntryRequest(
		@NotNull LocalDate entryDate,
		@NotNull @DecimalMin("1") BigDecimal weightKg) {
}
