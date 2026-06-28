package com.fatfitness.api.user.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.community.entity.ForumComment;
import com.fatfitness.api.community.entity.ForumCommentStatus;
import com.fatfitness.api.community.entity.ForumPost;
import com.fatfitness.api.community.entity.ForumPostStatus;
import com.fatfitness.api.community.repository.ForumCommentRepository;
import com.fatfitness.api.community.repository.ForumPostRepository;
import com.fatfitness.api.community.repository.PostLikeRepository;
import com.fatfitness.api.user.dto.PublicUserProfileResponse;
import com.fatfitness.api.user.dto.PublicUserProfileResponse.RecentCommentSummary;
import com.fatfitness.api.user.dto.PublicUserProfileResponse.RecentThreadSummary;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Service
public class PublicUserProfileService {

	private static final int MAX_EXCERPT_LENGTH = 200;
	private static final Set<UserRole> PUBLIC_ROLES = Set.of(UserRole.OWNER, UserRole.ADMIN, UserRole.MODERATOR);

	private final UserAccountRepository userAccountRepository;
	private final ForumPostRepository forumPostRepository;
	private final ForumCommentRepository forumCommentRepository;
	private final PostLikeRepository postLikeRepository;

	public PublicUserProfileService(
			UserAccountRepository userAccountRepository,
			ForumPostRepository forumPostRepository,
			ForumCommentRepository forumCommentRepository,
			PostLikeRepository postLikeRepository) {
		this.userAccountRepository = userAccountRepository;
		this.forumPostRepository = forumPostRepository;
		this.forumCommentRepository = forumCommentRepository;
		this.postLikeRepository = postLikeRepository;
	}

	@Transactional(readOnly = true)
	public PublicUserProfileResponse getProfile(UUID userId) {
		UserAccount user = userAccountRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

		if (user.getStatus() == UserStatus.DELETED) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}

		boolean isBanned = user.getStatus() == UserStatus.BANNED;
		String displayName = isBanned ? "Banned account" : user.getDisplayName();

		List<String> publicRoles = user.getRoles().stream()
				.filter(PUBLIC_ROLES::contains)
				.map(r -> r.name())
				.sorted()
				.toList();

		if (isBanned) {
			return new PublicUserProfileResponse(
					user.getId(), displayName, null, false,
					user.getCreatedAt(), publicRoles, 0, 0, 0,
					List.of(), List.of());
		}

		long threadCount = forumPostRepository.countByAuthorIdAndStatus(userId, ForumPostStatus.PUBLISHED);
		long commentCount = forumCommentRepository.countByAuthorIdAndStatus(userId, ForumCommentStatus.PUBLISHED);
		long likesReceived = postLikeRepository.countLikesReceivedByAuthorId(userId);

		List<ForumPost> recentPosts = forumPostRepository.findByAuthorIdAndStatusOrderByCreatedAtDesc(
				userId, ForumPostStatus.PUBLISHED, PageRequest.of(0, 10));

		List<ForumComment> recentComments = forumCommentRepository.findByAuthorIdAndStatusOrderByCreatedAtDesc(
				userId, ForumCommentStatus.PUBLISHED, PageRequest.of(0, 5));

		return new PublicUserProfileResponse(
				user.getId(),
				displayName,
				user.getCountryRegionCode(),
				user.hasAvatar(),
				user.getCreatedAt(),
				publicRoles,
				threadCount,
				commentCount,
				likesReceived,
				recentPosts.stream().map(PublicUserProfileService::toThreadSummary).toList(),
				recentComments.stream().map(PublicUserProfileService::toCommentSummary).toList());
	}

	private static RecentThreadSummary toThreadSummary(ForumPost post) {
		return new RecentThreadSummary(
				post.getId(),
				post.getTitle(),
				post.getCategory().getSlug(),
				post.getCategory().getName(),
				post.getCreatedAt());
	}

	private static RecentCommentSummary toCommentSummary(ForumComment comment) {
		String body = comment.getBody().replace("\n", " ").replaceAll("\\s+", " ").trim();
		String excerpt = body.length() > MAX_EXCERPT_LENGTH ? body.substring(0, MAX_EXCERPT_LENGTH) + "…" : body;
		return new RecentCommentSummary(
				comment.getId(),
				excerpt,
				comment.getPost().getId(),
				comment.getPost().getTitle(),
				comment.getCreatedAt());
	}
}
