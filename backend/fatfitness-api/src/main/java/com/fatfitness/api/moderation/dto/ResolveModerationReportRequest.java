package com.fatfitness.api.moderation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResolveModerationReportRequest(
		@NotNull
		ModerationReportResolutionStatus status,

		@Size(max = 1000)
		String resolutionNote
) {
}
