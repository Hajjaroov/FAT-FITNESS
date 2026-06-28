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
		boolean authorHasAvatar,
		ForumCommentStatus status,
		Instant createdAt,
		Instant updatedAt,
		Instant editedAt,
		long likeCount,
		Boolean likedByCurrentUser
) {
}
