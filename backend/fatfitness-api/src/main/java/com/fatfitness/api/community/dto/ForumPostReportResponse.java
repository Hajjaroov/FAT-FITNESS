package com.fatfitness.api.community.dto;

import java.time.Instant;
import java.util.UUID;

import com.fatfitness.api.community.entity.ForumReportStatus;

public record ForumPostReportResponse(
		UUID id,
		UUID postId,
		String reason,
		String details,
		ForumReportStatus status,
		Instant createdAt
) {
}
