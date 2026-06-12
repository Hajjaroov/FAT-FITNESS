package com.fatfitness.api.community.service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.community.dto.CreateForumPostRequest;
import com.fatfitness.api.community.dto.ForumPostReportResponse;
import com.fatfitness.api.community.dto.ForumPostResponse;
import com.fatfitness.api.community.dto.ReportForumPostRequest;
import com.fatfitness.api.community.entity.ForumCategory;
import com.fatfitness.api.community.entity.ForumPost;
import com.fatfitness.api.community.entity.ForumPostReport;
import com.fatfitness.api.community.entity.ForumPostStatus;
import com.fatfitness.api.community.repository.ForumCategoryRepository;
import com.fatfitness.api.community.repository.ForumPostReportRepository;
import com.fatfitness.api.community.repository.ForumPostRepository;
import com.fatfitness.api.user.entity.UserAccount;
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

	public ForumPostService(
			ForumCategoryRepository forumCategoryRepository,
			ForumPostRepository forumPostRepository,
			ForumPostReportRepository forumPostReportRepository,
			UserAccountRepository userAccountRepository,
			UserPublicDisplayNameService userPublicDisplayNameService) {
		this.forumCategoryRepository = forumCategoryRepository;
		this.forumPostRepository = forumPostRepository;
		this.forumPostReportRepository = forumPostReportRepository;
		this.userAccountRepository = userAccountRepository;
		this.userPublicDisplayNameService = userPublicDisplayNameService;
	}

	@Transactional(readOnly = true)
	public List<ForumPostResponse> listPosts(String categorySlug, Integer limit) {
		PageRequest pageRequest = PageRequest.of(0, cleanLimit(limit));

		if (categorySlug == null || categorySlug.isBlank()) {
			return forumPostRepository.findByStatusOrderByCreatedAtDesc(ForumPostStatus.PUBLISHED, pageRequest)
					.stream()
					.map(this::toResponse)
					.toList();
		}

		String cleanedCategorySlug = normalizeSlug(categorySlug);
		if (forumCategoryRepository.findBySlugAndActiveTrue(cleanedCategorySlug).isEmpty()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum category not found");
		}

		return forumPostRepository
				.findByStatusAndCategorySlugOrderByCreatedAtDesc(
						ForumPostStatus.PUBLISHED,
						cleanedCategorySlug,
						pageRequest)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public ForumPostResponse getPost(UUID postId) {
		return forumPostRepository.findByIdAndStatus(postId, ForumPostStatus.PUBLISHED)
				.map(this::toResponse)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post not found"));
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

		return toResponse(post);
	}

	@Transactional
	public ForumPostReportResponse reportPost(
			UUID postId,
			ReportForumPostRequest request,
			String userIdSubject) {
		UserAccount reporter = requireActiveUser(userIdSubject);
		ForumPost post = forumPostRepository.findByIdAndStatus(postId, ForumPostStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post not found"));

		return forumPostReportRepository.findByPostIdAndReporterId(post.getId(), reporter.getId())
				.map(ForumPostService::toReportResponse)
				.orElseGet(() -> toReportResponse(forumPostReportRepository.save(new ForumPostReport(
						post,
						reporter,
						cleanSingleLine(request.reason()),
						cleanOptionalSingleLine(request.details())))));
	}

	private UserAccount requireActiveUser(String userIdSubject) {
		UserAccount user = userAccountRepository.findById(parseUserIdSubject(userIdSubject))
				.orElseThrow(ForumPostService::invalidAccessToken);

		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}

		return user;
	}

	private ForumPostResponse toResponse(ForumPost post) {
		return new ForumPostResponse(
				post.getId(),
				post.getCategory().getSlug(),
				post.getCategory().getName(),
				post.getTitle(),
				post.getBody(),
				userPublicDisplayNameService.resolve(post.getAuthor()),
				post.getStatus(),
				post.isLocked(),
				post.getCreatedAt(),
				post.getUpdatedAt());
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
