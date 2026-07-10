package com.fatfitness.api.myplan.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;

public record ReorderWorkoutPlanDaysRequest(@NotEmpty List<UUID> orderedDayIds) {
}
