package com.fatfitness.api.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.community.entity.ForumPost;
import com.fatfitness.api.community.entity.ForumPostStatus;

public interface ForumPostRepository extends JpaRepository<ForumPost, UUID> {

	// author and category are LAZY; response mapping reads both, so list/detail
	// finders join-fetch them to avoid one extra select per row (N+1).
	@EntityGraph(attributePaths = {"author", "category"})
	List<ForumPost> findByStatusOrderByCreatedAtDesc(ForumPostStatus status, Pageable pageable);

	@EntityGraph(attributePaths = {"author", "category"})
	List<ForumPost> findByStatusAndCategorySlugOrderByCreatedAtDesc(
			ForumPostStatus status,
			String categorySlug,
			Pageable pageable);

	@EntityGraph(attributePaths = {"author", "category"})
	Optional<ForumPost> findByIdAndStatus(UUID id, ForumPostStatus status);

	@EntityGraph(attributePaths = {"author", "category"})
	List<ForumPost> findByAuthorIdAndStatusOrderByCreatedAtDesc(UUID authorId, ForumPostStatus status, Pageable pageable);

	long countByAuthorIdAndStatus(UUID authorId, ForumPostStatus status);
}
