package com.fatfitness.api.community.dto;

import java.util.UUID;

public record ForumCategoryResponse(
		UUID id,
		String slug,
		String name,
		String description,
		int displayOrder
) {
}
