package com.fatfitness.api.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.community.entity.ForumComment;
import com.fatfitness.api.community.entity.ForumCommentStatus;

public interface ForumCommentRepository extends JpaRepository<ForumComment, UUID> {

	List<ForumComment> findByPostIdAndStatusOrderByCreatedAtAsc(
			UUID postId,
			ForumCommentStatus status,
			Pageable pageable);

	Optional<ForumComment> findByIdAndStatus(UUID id, ForumCommentStatus status);
}
