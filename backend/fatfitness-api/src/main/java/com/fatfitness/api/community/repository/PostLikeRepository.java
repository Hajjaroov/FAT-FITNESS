package com.fatfitness.api.community.repository;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fatfitness.api.community.entity.PostLike;

public interface PostLikeRepository extends JpaRepository<PostLike, UUID> {

	Optional<PostLike> findByPostIdAndUserId(UUID postId, UUID userId);

	long countByPostId(UUID postId);

	@Query("select pl.post.id, count(pl) from PostLike pl where pl.post.id in :postIds group by pl.post.id")
	java.util.List<Object[]> countGroupedByPostIds(@Param("postIds") Collection<UUID> postIds);

	@Query("select pl.post.id from PostLike pl where pl.post.id in :postIds and pl.user.id = :userId")
	Set<UUID> findLikedPostIdsByUserAndPostIds(@Param("userId") UUID userId, @Param("postIds") Collection<UUID> postIds);
}
