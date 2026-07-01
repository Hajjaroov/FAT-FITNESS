package com.fatfitness.api.myplan.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record WeightEntryResponse(
		UUID id,
		LocalDate entryDate,
		BigDecimal weightKg,
		Instant createdAt) {
}
