package com.fatfitness.api.community.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateForumCommentRequest(
		@NotBlank
		@Size(min = 2, max = 6000)
		String body,

		@AssertTrue(message = "Community guidelines must be accepted before commenting")
		boolean acceptedCommunityGuidelines
) {
}
