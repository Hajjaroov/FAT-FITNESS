package com.fatfitness.api.community.service;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.community.dto.CreateForumPostRequest;
import com.fatfitness.api.community.dto.ForumPostReportResponse;
import com.fatfitness.api.community.dto.ForumPostResponse;
import com.fatfitness.api.community.dto.ReportForumPostRequest;
import com.fatfitness.api.community.dto.UpdateForumPostRequest;
import com.fatfitness.api.community.entity.ForumCategory;
import com.fatfitness.api.community.entity.ForumPost;
import com.fatfitness.api.community.entity.ForumPostReport;
import com.fatfitness.api.community.entity.ForumPostStatus;
import com.fatfitness.api.community.repository.ForumCategoryRepository;
import com.fatfitness.api.community.repository.ForumPostReportRepository;
import com.fatfitness.api.community.repository.ForumPostRepository;
import com.fatfitness.api.community.repository.PostBookmarkRepository;
import com.fatfitness.api.community.repository.PostLikeRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;
import com.fatfitness.api.user.service.UserPublicDisplayNameService;

@Service
public class ForumPostService {

	private static final int DEFAULT_LIMIT = 20;
	private static final int MAX_LIMIT = 50;

	private final ForumCategoryRepository forumCategoryRepository;
	private final ForumPostRepository forumPostRepository;
	private final ForumPostReportRepository forumPostReportRepository;
	private final UserAccountRepository userAccountRepository;
	private final UserPublicDisplayNameService userPublicDisplayNameService;
	private final PostLikeRepository postLikeRepository;
	private final PostBookmarkRepository postBookmarkRepository;

	public ForumPostService(
			ForumCategoryRepository forumCategoryRepository,
			ForumPostRepository forumPostRepository,
			ForumPostReportRepository forumPostReportRepository,
			UserAccountRepository userAccountRepository,
			UserPublicDisplayNameService userPublicDisplayNameService,
			PostLikeRepository postLikeRepository,
			PostBookmarkRepository postBookmarkRepository) {
		this.forumCategoryRepository = forumCategoryRepository;
		this.forumPostRepository = forumPostRepository;
		this.forumPostReportRepository = forumPostReportRepository;
		this.userAccountRepository = userAccountRepository;
		this.userPublicDisplayNameService = userPublicDisplayNameService;
		this.postLikeRepository = postLikeRepository;
		this.postBookmarkRepository = postBookmarkRepository;
	}

	@Transactional(readOnly = true)
	public List<ForumPostResponse> listPosts(String categorySlug, Integer limit, UUID currentUserId) {
		PageRequest pageRequest = PageRequest.of(0, cleanLimit(limit));
		List<ForumPost> posts;

		if (categorySlug == null || categorySlug.isBlank()) {
			posts = forumPostRepository.findByStatusOrderByCreatedAtDesc(ForumPostStatus.PUBLISHED, pageRequest);
		} else {
			String cleanedCategorySlug = normalizeSlug(categorySlug);
			if (forumCategoryRepository.findBySlugAndActiveTrue(cleanedCategorySlug).isEmpty()) {
				throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum category not found");
			}
			posts = forumPostRepository.findByStatusAndCategorySlugOrderByCreatedAtDesc(
					ForumPostStatus.PUBLISHED, cleanedCategorySlug, pageRequest);
		}

		return enrichAndMap(posts, currentUserId);
	}

	@Transactional(readOnly = true)
	public ForumPostResponse getPost(UUID postId, UUID currentUserId) {
		ForumPost post = forumPostRepository.findByIdAndStatus(postId, ForumPostStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post not found"));

		long likeCount = postLikeRepository.countByPostId(post.getId());
		Boolean liked = currentUserId != null
				? postLikeRepository.findByPostIdAndUserId(post.getId(), currentUserId).isPresent()
				: null;
		Boolean bookmarked = currentUserId != null
				? postBookmarkRepository.findByPostIdAndUserId(post.getId(), currentUserId).isPresent()
				: null;

		return toResponse(post, likeCount, liked, bookmarked);
	}

	@Transactional
	public ForumPostResponse createPost(CreateForumPostRequest request, String userIdSubject) {
		UserAccount author = requireActiveUser(userIdSubject);
		ForumCategory category = forumCategoryRepository.findBySlugAndActiveTrue(normalizeSlug(request.categorySlug()))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum category not found"));
		ForumPost post = forumPostRepository.save(new ForumPost(
				category,
				author,
				cleanSingleLine(request.title()),
				cleanMultiline(request.body())));

		return toResponse(post, 0, false, false);
	}

	@Transactional
	public ForumPostReportResponse reportPost(
			UUID postId,
			ReportForumPostRequest request,
			String userIdSubject) {
		UserAccount reporter = requireActiveUser(userIdSubject);
		ForumPost post = forumPostRepository.findByIdAndStatus(postId, ForumPostStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post not found"));

		Optional<ForumPostReport> existing = forumPostReportRepository.findByPostIdAndReporterId(
				post.getId(), reporter.getId());
		if (existing.isPresent()) {
			return toReportResponse(existing.get());
		}

		try {
			// saveAndFlush so a concurrent duplicate-report insert surfaces here
			// rather than at commit time, where this catch could no longer help.
			return toReportResponse(forumPostReportRepository.saveAndFlush(new ForumPostReport(
					post,
					reporter,
					cleanSingleLine(request.reason()),
					cleanOptionalSingleLine(request.details()))));
		}
		catch (DataIntegrityViolationException ex) {
			// Another concurrent request already created this report; same
			// idempotent contract as the sequential case above.
			return forumPostReportRepository.findByPostIdAndReporterId(post.getId(), reporter.getId())
					.map(ForumPostService::toReportResponse)
					.orElseThrow(() -> ex);
		}
	}

	public List<ForumPostResponse> enrichAndMap(List<ForumPost> posts, UUID currentUserId) {
		if (posts.isEmpty()) {
			return List.of();
		}

		List<UUID> postIds = posts.stream().map(p -> p.getId()).toList();
		Map<UUID, Long> likeCounts = buildLikeCountMap(postIds);
		Set<UUID> likedIds = currentUserId != null
				? postLikeRepository.findLikedPostIdsByUserAndPostIds(currentUserId, postIds)
				: Set.of();
		Set<UUID> bookmarkedIds = currentUserId != null
				? postBookmarkRepository.findBookmarkedPostIdsByUserAndPostIds(currentUserId, postIds)
				: Set.of();

		return posts.stream()
				.map(p -> toResponse(
						p,
						likeCounts.getOrDefault(p.getId(), 0L),
						currentUserId != null ? likedIds.contains(p.getId()) : null,
						currentUserId != null ? bookmarkedIds.contains(p.getId()) : null))
				.toList();
	}

	private Map<UUID, Long> buildLikeCountMap(Collection<UUID> postIds) {
		return postLikeRepository.countGroupedByPostIds(postIds)
				.stream()
				.collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));
	}

	private UserAccount requireActiveUser(String userIdSubject) {
		UserAccount user = userAccountRepository.findById(parseUserIdSubject(userIdSubject))
				.orElseThrow(ForumPostService::invalidAccessToken);

		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}

		return user;
	}

	private static final Set<UserRole> EDITOR_ROLES = Set.of(UserRole.OWNER, UserRole.ADMIN, UserRole.MODERATOR);

	private static boolean canEditPost(UserAccount caller, ForumPost post) {
		return caller.getId().equals(post.getAuthor().getId())
				|| caller.getRoles().stream().anyMatch(EDITOR_ROLES::contains);
	}

	@Transactional
	public ForumPostResponse updatePost(UUID postId, UpdateForumPostRequest request, String userIdSubject) {
		UserAccount caller = requireActiveUser(userIdSubject);
		ForumPost post = forumPostRepository.findByIdAndStatus(postId, ForumPostStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post not found"));

		if (!canEditPost(caller, post)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to edit this post");
		}

		String newTitle = request.title() != null ? cleanSingleLine(request.title()) : post.getTitle();
		String newBody = request.body() != null ? cleanMultiline(request.body()) : post.getBody();
		post.edit(newTitle, newBody);
		forumPostRepository.save(post);

		long likeCount = postLikeRepository.countByPostId(post.getId());
		Boolean liked = postLikeRepository.findByPostIdAndUserId(post.getId(), caller.getId()).isPresent();
		Boolean bookmarked = postBookmarkRepository.findByPostIdAndUserId(post.getId(), caller.getId()).isPresent();
		return toResponse(post, likeCount, liked, bookmarked);
	}

	@Transactional
	public void deletePost(UUID postId, String userIdSubject) {
		UserAccount caller = requireActiveUser(userIdSubject);
		ForumPost post = forumPostRepository.findByIdAndStatus(postId, ForumPostStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post not found"));

		if (!canEditPost(caller, post)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this post");
		}

		post.softDelete();
		forumPostRepository.save(post);
	}

	private ForumPostResponse toResponse(ForumPost post, long likeCount, Boolean liked, Boolean bookmarked) {
		return new ForumPostResponse(
				post.getId(),
				post.getCategory().getSlug(),
				post.getCategory().getName(),
				post.getTitle(),
				post.getBody(),
				post.getAuthor().getId(),
				userPublicDisplayNameService.resolve(post.getAuthor()),
				post.getAuthor().hasAvatar(),
				post.getStatus(),
				post.isLocked(),
				post.getCreatedAt(),
				post.getUpdatedAt(),
				post.getEditedAt(),
				likeCount,
				liked,
				bookmarked);
	}

	private static ForumPostReportResponse toReportResponse(ForumPostReport report) {
		return new ForumPostReportResponse(
				report.getId(),
				report.getPost().getId(),
				report.getReason(),
				report.getDetails(),
				report.getStatus(),
				report.getCreatedAt());
	}

	private static int cleanLimit(Integer limit) {
		if (limit == null) {
			return DEFAULT_LIMIT;
		}

		return Math.max(1, Math.min(limit, MAX_LIMIT));
	}

	private static String normalizeSlug(String slug) {
		return slug.trim().toLowerCase(Locale.ROOT);
	}

	private static String cleanSingleLine(String value) {
		return value.trim().replaceAll("\\s+", " ");
	}

	private static String cleanMultiline(String value) {
		return value.trim().replace("\r\n", "\n").replace('\r', '\n');
	}

	private static String cleanOptionalSingleLine(String value) {
		if (value == null) {
			return null;
		}

		String cleaned = value.trim().replaceAll("\\s+", " ");
		return cleaned.isEmpty() ? null : cleaned;
	}

	private static UUID parseUserIdSubject(String subject) {
		try {
			return UUID.fromString(subject);
		}
		catch (RuntimeException ex) {
			throw invalidAccessToken();
		}
	}

	private static ResponseStatusException invalidAccessToken() {
		return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid access token");
	}
}
