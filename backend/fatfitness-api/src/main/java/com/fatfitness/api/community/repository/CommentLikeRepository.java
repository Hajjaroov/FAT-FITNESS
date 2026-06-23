package com.fatfitness.api.community.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fatfitness.api.community.entity.CommentLike;

public interface CommentLikeRepository extends JpaRepository<CommentLike, UUID> {

	Optional<CommentLike> findByCommentIdAndUserId(UUID commentId, UUID userId);

	long countByCommentId(UUID commentId);

	@Query("select cl.comment.id, count(cl) from CommentLike cl where cl.comment.id in :commentIds group by cl.comment.id")
	List<Object[]> countGroupedByCommentIds(@Param("commentIds") Collection<UUID> commentIds);

	@Query("select cl.comment.id from CommentLike cl where cl.comment.id in :commentIds and cl.user.id = :userId")
	Set<UUID> findLikedCommentIdsByUserAndCommentIds(@Param("userId") UUID userId, @Param("commentIds") Collection<UUID> commentIds);
}
