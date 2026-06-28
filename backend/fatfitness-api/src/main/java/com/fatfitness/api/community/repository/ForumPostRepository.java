package com.fatfitness.api.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.community.entity.ForumPost;
import com.fatfitness.api.community.entity.ForumPostStatus;

public interface ForumPostRepository extends JpaRepository<ForumPost, UUID> {

	List<ForumPost> findByStatusOrderByCreatedAtDesc(ForumPostStatus status, Pageable pageable);

	List<ForumPost> findByStatusAndCategorySlugOrderByCreatedAtDesc(
			ForumPostStatus status,
			String categorySlug,
			Pageable pageable);

	Optional<ForumPost> findByIdAndStatus(UUID id, ForumPostStatus status);

	List<ForumPost> findByAuthorIdAndStatusOrderByCreatedAtDesc(UUID authorId, ForumPostStatus status, Pageable pageable);

	long countByAuthorIdAndStatus(UUID authorId, ForumPostStatus status);
}
