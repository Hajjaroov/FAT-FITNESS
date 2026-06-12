package com.fatfitness.api.moderation.dto;

import java.time.Instant;
import java.util.UUID;

import com.fatfitness.api.community.entity.ForumReportStatus;

public record ModerationReportResponse(
		UUID id,
		ModerationReportTargetType targetType,
		UUID targetId,
		UUID postId,
		String targetTitle,
		String targetPreview,
		UUID contentAuthorUserId,
		String contentAuthorDisplayName,
		UUID reporterUserId,
		String reporterDisplayName,
		String reason,
		String details,
		ForumReportStatus status,
		Instant createdAt,
		Instant resolvedAt,
		UUID resolvedByUserId,
		String resolvedByDisplayName,
		String resolutionNote
) {
}
