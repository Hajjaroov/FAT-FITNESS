package com.fatfitness.api.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.community.entity.ForumComment;
import com.fatfitness.api.community.entity.ForumCommentStatus;

public interface ForumCommentRepository extends JpaRepository<ForumComment, UUID> {

	// author is LAZY and read by every response mapping; join-fetch to avoid N+1.
	@EntityGraph(attributePaths = {"author"})
	List<ForumComment> findByPostIdAndStatusOrderByCreatedAtAsc(
			UUID postId,
			ForumCommentStatus status,
			Pageable pageable);

	@EntityGraph(attributePaths = {"author"})
	Optional<ForumComment> findByIdAndStatus(UUID id, ForumCommentStatus status);

	// The public profile view also reads comment.getPost().getTitle().
	@EntityGraph(attributePaths = {"author", "post"})
	List<ForumComment> findByAuthorIdAndStatusOrderByCreatedAtDesc(UUID authorId, ForumCommentStatus status, Pageable pageable);

	long countByAuthorIdAndStatus(UUID authorId, ForumCommentStatus status);
}
