package com.fatfitness.api.user.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PublicUserProfileResponse(
		UUID userId,
		String displayName,
		String countryRegionCode,
		boolean hasAvatar,
		Instant joinedAt,
		List<String> publicRoles,
		long threadCount,
		long commentCount,
		long likesReceived,
		List<RecentThreadSummary> recentThreads,
		List<RecentCommentSummary> recentComments
) {

	public record RecentThreadSummary(
			UUID id,
			String title,
			String categorySlug,
			String categoryName,
			Instant createdAt
	) {
	}

	public record RecentCommentSummary(
			UUID commentId,
			String excerpt,
			UUID postId,
			String postTitle,
			Instant createdAt
	) {
	}
}
