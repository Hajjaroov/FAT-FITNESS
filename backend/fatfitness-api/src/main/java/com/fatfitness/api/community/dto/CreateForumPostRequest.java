package com.fatfitness.api.community.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateForumPostRequest(
		@NotBlank
		@Size(max = 120)
		String categorySlug,

		@NotBlank
		@Size(min = 4, max = 160)
		String title,

		@NotBlank
		@Size(min = 20, max = 12000)
		String body,

		@AssertTrue(message = "Community guidelines must be accepted before posting")
		boolean acceptedCommunityGuidelines
) {
}
