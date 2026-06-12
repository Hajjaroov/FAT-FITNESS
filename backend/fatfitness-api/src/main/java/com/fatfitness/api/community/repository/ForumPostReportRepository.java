package com.fatfitness.api.community.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.community.entity.ForumPostReport;

public interface ForumPostReportRepository extends JpaRepository<ForumPostReport, UUID> {

	Optional<ForumPostReport> findByPostIdAndReporterId(UUID postId, UUID reporterId);
}
