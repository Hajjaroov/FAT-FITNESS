package com.fatfitness.api.community.service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.community.dto.CreateForumCommentRequest;
import com.fatfitness.api.community.dto.ForumCommentReportResponse;
import com.fatfitness.api.community.dto.ForumCommentResponse;
import com.fatfitness.api.community.dto.ReportForumCommentRequest;
import com.fatfitness.api.community.dto.UpdateForumCommentRequest;
import com.fatfitness.api.community.entity.ForumComment;
import com.fatfitness.api.community.entity.ForumCommentReport;
import com.fatfitness.api.community.entity.ForumCommentStatus;
import com.fatfitness.api.community.entity.ForumPost;
import com.fatfitness.api.community.entity.ForumPostStatus;
import com.fatfitness.api.community.repository.CommentLikeRepository;
import com.fatfitness.api.community.repository.ForumCommentReportRepository;
import com.fatfitness.api.community.repository.ForumCommentRepository;
import com.fatfitness.api.community.repository.ForumPostRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;
import com.fatfitness.api.user.service.UserPublicDisplayNameService;

@Service
public class ForumCommentService {

	private static final int DEFAULT_LIMIT = 50;
	private static final int MAX_LIMIT = 100;

	private final ForumPostRepository forumPostRepository;
	private final ForumCommentRepository forumCommentRepository;
	private final ForumCommentReportRepository forumCommentReportRepository;
	private final UserAccountRepository userAccountRepository;
	private final UserPublicDisplayNameService userPublicDisplayNameService;
	private final CommentLikeRepository commentLikeRepository;

	public ForumCommentService(
			ForumPostRepository forumPostRepository,
			ForumCommentRepository forumCommentRepository,
			ForumCommentReportRepository forumCommentReportRepository,
			UserAccountRepository userAccountRepository,
			UserPublicDisplayNameService userPublicDisplayNameService,
			CommentLikeRepository commentLikeRepository) {
		this.forumPostRepository = forumPostRepository;
		this.forumCommentRepository = forumCommentRepository;
		this.forumCommentReportRepository = forumCommentReportRepository;
		this.userAccountRepository = userAccountRepository;
		this.userPublicDisplayNameService = userPublicDisplayNameService;
		this.commentLikeRepository = commentLikeRepository;
	}

	@Transactional(readOnly = true)
	public List<ForumCommentResponse> listComments(UUID postId, Integer limit, UUID currentUserId) {
		ForumPost post = requirePublishedPost(postId);
		List<ForumComment> comments = forumCommentRepository
				.findByPostIdAndStatusOrderByCreatedAtAsc(
						post.getId(),
						ForumCommentStatus.PUBLISHED,
						PageRequest.of(0, cleanLimit(limit)));

		if (comments.isEmpty()) {
			return List.of();
		}

		List<UUID> commentIds = comments.stream().map(c -> c.getId()).toList();
		Map<UUID, Long> likeCounts = buildLikeCountMap(commentIds);
		Set<UUID> likedIds = currentUserId != null
				? commentLikeRepository.findLikedCommentIdsByUserAndCommentIds(currentUserId, commentIds)
				: Set.of();

		return comments.stream()
				.map(c -> toResponse(
						c,
						likeCounts.getOrDefault(c.getId(), 0L),
						currentUserId != null ? likedIds.contains(c.getId()) : null))
				.toList();
	}

	@Transactional
	public ForumCommentResponse createComment(
			UUID postId,
			CreateForumCommentRequest request,
			String userIdSubject) {
		UserAccount author = requireActiveUser(userIdSubject);
		ForumPost post = requirePublishedPost(postId);

		if (post.isLocked()) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forum post is locked");
		}

		return toResponse(forumCommentRepository.save(new ForumComment(
				post,
				author,
				cleanMultiline(request.body()))), 0, false);
	}

	@Transactional
	public ForumCommentReportResponse reportComment(
			UUID commentId,
			ReportForumCommentRequest request,
			String userIdSubject) {
		UserAccount reporter = requireActiveUser(userIdSubject);
		ForumComment comment = forumCommentRepository.findByIdAndStatus(commentId, ForumCommentStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum comment not found"));

		return forumCommentReportRepository.findByCommentIdAndReporterId(comment.getId(), reporter.getId())
				.map(ForumCommentService::toReportResponse)
				.orElseGet(() -> toReportResponse(forumCommentReportRepository.save(new ForumCommentReport(
						comment,
						reporter,
						cleanSingleLine(request.reason()),
						cleanOptionalSingleLine(request.details())))));
	}

	private static final Set<UserRole> EDITOR_ROLES = Set.of(UserRole.OWNER, UserRole.ADMIN, UserRole.MODERATOR);

	private static boolean canEditComment(UserAccount caller, ForumComment comment) {
		return caller.getId().equals(comment.getAuthor().getId())
				|| caller.getRoles().stream().anyMatch(EDITOR_ROLES::contains);
	}

	@Transactional
	public ForumCommentResponse updateComment(UUID commentId, UpdateForumCommentRequest request, String userIdSubject) {
		UserAccount caller = requireActiveUser(userIdSubject);
		ForumComment comment = forumCommentRepository.findByIdAndStatus(commentId, ForumCommentStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum comment not found"));

		if (!canEditComment(caller, comment)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to edit this comment");
		}

		comment.edit(cleanMultiline(request.body()));
		forumCommentRepository.save(comment);

		long likeCount = commentLikeRepository.countByCommentId(comment.getId());
		Boolean liked = commentLikeRepository.findByCommentIdAndUserId(comment.getId(), caller.getId()).isPresent();
		return toResponse(comment, likeCount, liked);
	}

	@Transactional
	public void deleteComment(UUID commentId, String userIdSubject) {
		UserAccount caller = requireActiveUser(userIdSubject);
		ForumComment comment = forumCommentRepository.findByIdAndStatus(commentId, ForumCommentStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum comment not found"));

		if (!canEditComment(caller, comment)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this comment");
		}

		comment.softDelete();
		forumCommentRepository.save(comment);
	}

	private Map<UUID, Long> buildLikeCountMap(Collection<UUID> commentIds) {
		return commentLikeRepository.countGroupedByCommentIds(commentIds)
				.stream()
				.collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));
	}

	private ForumPost requirePublishedPost(UUID postId) {
		return forumPostRepository.findByIdAndStatus(postId, ForumPostStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post not found"));
	}

	private UserAccount requireActiveUser(String userIdSubject) {
		UserAccount user = userAccountRepository.findById(parseUserIdSubject(userIdSubject))
				.orElseThrow(ForumCommentService::invalidAccessToken);

		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}

		return user;
	}

	private ForumCommentResponse toResponse(ForumComment comment, long likeCount, Boolean liked) {
		return new ForumCommentResponse(
				comment.getId(),
				comment.getPost().getId(),
				comment.getBody(),
				comment.getAuthor().getId(),
				userPublicDisplayNameService.resolve(comment.getAuthor()),
				comment.getAuthor().hasAvatar(),
				comment.getStatus(),
				comment.getCreatedAt(),
				comment.getUpdatedAt(),
				comment.getEditedAt(),
				likeCount,
				liked);
	}

	private static ForumCommentReportResponse toReportResponse(ForumCommentReport report) {
		return new ForumCommentReportResponse(
				report.getId(),
				report.getComment().getId(),
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
