package com.fatfitness.api.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.community.entity.ForumCommentReport;
import com.fatfitness.api.community.entity.ForumReportStatus;

public interface ForumCommentReportRepository extends JpaRepository<ForumCommentReport, UUID> {

	Optional<ForumCommentReport> findByCommentIdAndReporterId(UUID commentId, UUID reporterId);

	// The moderation list maps comment, comment.post, comment.author, reporter, and resolvedBy per row.
	@EntityGraph(attributePaths = {"comment", "comment.post", "comment.author", "reporter", "resolvedBy"})
	List<ForumCommentReport> findAllByOrderByCreatedAtDesc(Pageable pageable);

	@EntityGraph(attributePaths = {"comment", "comment.post", "comment.author", "reporter", "resolvedBy"})
	List<ForumCommentReport> findByStatusOrderByCreatedAtDesc(ForumReportStatus status, Pageable pageable);
}
