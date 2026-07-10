package com.fatfitness.api.myplan.dto;

import java.time.DayOfWeek;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateWorkoutPlanDayRequest(
		@NotBlank @Size(max = 120) String title,
		DayOfWeek weekday) {
}
