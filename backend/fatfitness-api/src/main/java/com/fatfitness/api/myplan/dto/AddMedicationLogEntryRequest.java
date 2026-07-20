package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddMedicationLogEntryRequest(
		@NotNull LocalDate entryDate,
		@NotNull @DecimalMin("0.01") @DecimalMax("9999.99") BigDecimal doseMg,
		@Size(max = 1000) String notes,
		@DecimalMin("1") @DecimalMax("9999.99") BigDecimal weightKg) {
}
