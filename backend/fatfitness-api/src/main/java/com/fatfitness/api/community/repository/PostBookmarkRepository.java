package com.fatfitness.api.community.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fatfitness.api.community.entity.ForumPost;
import com.fatfitness.api.community.entity.PostBookmark;

public interface PostBookmarkRepository extends JpaRepository<PostBookmark, UUID> {

	Optional<PostBookmark> findByPostIdAndUserId(UUID postId, UUID userId);

	@Query("select pb.post from PostBookmark pb where pb.user.id = :userId order by pb.createdAt desc")
	List<ForumPost> findBookmarkedPostsByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

	@Query("select pb.post.id from PostBookmark pb where pb.post.id in :postIds and pb.user.id = :userId")
	Set<UUID> findBookmarkedPostIdsByUserAndPostIds(@Param("userId") UUID userId, @Param("postIds") Collection<UUID> postIds);
}
