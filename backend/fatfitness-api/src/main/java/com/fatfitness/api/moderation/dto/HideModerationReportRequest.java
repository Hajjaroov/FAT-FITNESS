package com.fatfitness.api.moderation.dto;

import jakarta.validation.constraints.Size;

public record HideModerationReportRequest(
		@Size(max = 1000)
		String resolutionNote
) {
}
