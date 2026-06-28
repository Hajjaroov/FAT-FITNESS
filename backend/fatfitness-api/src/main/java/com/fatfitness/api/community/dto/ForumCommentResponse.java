package com.fatfitness.api.community.dto;

import java.time.Instant;
import java.util.UUID;

import com.fatfitness.api.community.entity.ForumCommentStatus;

public record ForumCommentResponse(
		UUID id,
		UUID postId,
		String body,
		UUID authorId,
		String authorDisplayName,
		ForumCommentStatus status,
		Instant createdAt,
		Instant updatedAt,
		long likeCount,
		Boolean likedByCurrentUser
) {
}
