package com.fatfitness.api.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateForumCommentRequest(
		@NotBlank @Size(min = 2, max = 5000) String body
) {
}
