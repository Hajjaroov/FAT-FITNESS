package com.fatfitness.api.myplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateDietMealRequest(@NotBlank @Size(max = 120) String title) {
}
