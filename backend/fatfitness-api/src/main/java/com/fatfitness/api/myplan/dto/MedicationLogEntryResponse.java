package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record MedicationLogEntryResponse(
		UUID id,
		LocalDate entryDate,
		BigDecimal doseMg,
		String notes,
		Instant updatedAt) {
}
