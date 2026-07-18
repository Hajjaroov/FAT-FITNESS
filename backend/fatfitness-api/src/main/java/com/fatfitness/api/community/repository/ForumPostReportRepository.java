package com.fatfitness.api.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.community.entity.ForumReportStatus;
import com.fatfitness.api.community.entity.ForumPostReport;

public interface ForumPostReportRepository extends JpaRepository<ForumPostReport, UUID> {

	Optional<ForumPostReport> findByPostIdAndReporterId(UUID postId, UUID reporterId);

	// The moderation list maps post, post.author, reporter, and resolvedBy per row.
	@EntityGraph(attributePaths = {"post", "post.author", "reporter", "resolvedBy"})
	List<ForumPostReport> findAllByOrderByCreatedAtDesc(Pageable pageable);

	@EntityGraph(attributePaths = {"post", "post.author", "reporter", "resolvedBy"})
	List<ForumPostReport> findByStatusOrderByCreatedAtDesc(ForumReportStatus status, Pageable pageable);
}
