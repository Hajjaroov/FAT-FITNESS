package com.fatfitness.api.community.dto;

import java.time.Instant;
import java.util.UUID;

import com.fatfitness.api.community.entity.ForumPostStatus;

public record ForumPostResponse(
		UUID id,
		String categorySlug,
		String categoryName,
		String title,
		String body,
		UUID authorId,
		String authorDisplayName,
		boolean authorHasAvatar,
		ForumPostStatus status,
		boolean locked,
		Instant createdAt,
		Instant updatedAt,
		Instant editedAt,
		long likeCount,
		Boolean likedByCurrentUser,
		Boolean bookmarkedByCurrentUser
) {
}
