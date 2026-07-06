package com.fatfitness.api.myplan.dto;

import jakarta.validation.constraints.Size;

public record AddDietMealRequest(@Size(max = 120) String title) {
}
