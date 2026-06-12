package com.fatfitness.api.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.community.entity.ForumCommentReport;
import com.fatfitness.api.community.entity.ForumReportStatus;

public interface ForumCommentReportRepository extends JpaRepository<ForumCommentReport, UUID> {

	Optional<ForumCommentReport> findByCommentIdAndReporterId(UUID commentId, UUID reporterId);

	List<ForumCommentReport> findAllByOrderByCreatedAtDesc(Pageable pageable);

	List<ForumCommentReport> findByStatusOrderByCreatedAtDesc(ForumReportStatus status, Pageable pageable);
}
