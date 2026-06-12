package com.fatfitness.api.community.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.community.entity.ForumCommentReport;

public interface ForumCommentReportRepository extends JpaRepository<ForumCommentReport, UUID> {

	Optional<ForumCommentReport> findByCommentIdAndReporterId(UUID commentId, UUID reporterId);
}
