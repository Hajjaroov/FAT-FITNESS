package com.fatfitness.api.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReportForumCommentRequest(
		@NotBlank
		@Size(max = 80)
		String reason,

		@Size(max = 1000)
		String details
) {
}
