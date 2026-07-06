package com.fatfitness.api.moderation.service;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.community.entity.ForumComment;
import com.fatfitness.api.community.entity.ForumCommentReport;
import com.fatfitness.api.community.entity.ForumPost;
import com.fatfitness.api.community.entity.ForumPostReport;
import com.fatfitness.api.community.entity.ForumReportStatus;
import com.fatfitness.api.community.repository.ForumCommentReportRepository;
import com.fatfitness.api.community.repository.ForumPostReportRepository;
import com.fatfitness.api.community.repository.ForumPostRepository;
import com.fatfitness.api.auth.repository.RefreshSessionRepository;
import com.fatfitness.api.moderation.entity.ModerationAction;
import com.fatfitness.api.moderation.repository.ModerationActionRepository;
import com.fatfitness.api.moderation.dto.HideModerationReportRequest;
import com.fatfitness.api.moderation.dto.ModerationReportResolutionStatus;
import com.fatfitness.api.moderation.dto.ModerationReportResponse;
import com.fatfitness.api.moderation.dto.ModerationReportTargetType;
import com.fatfitness.api.moderation.dto.ResolveModerationReportRequest;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;
import com.fatfitness.api.user.service.UserPublicDisplayNameService;

@Service
public class ModerationReportService {

	private static final Logger log = LoggerFactory.getLogger(ModerationReportService.class);
	private static final int DEFAULT_LIMIT = 50;
	private static final int MAX_LIMIT = 100;
	private static final int PREVIEW_LIMIT = 220;
	private static final Set<UserRole> MODERATION_ROLES = Set.of(
			UserRole.OWNER,
			UserRole.ADMIN,
			UserRole.MODERATOR);

	private final ForumPostReportRepository forumPostReportRepository;
	private final ForumCommentReportRepository forumCommentReportRepository;
	private final ForumPostRepository forumPostRepository;
	private final UserAccountRepository userAccountRepository;
	private final UserPublicDisplayNameService userPublicDisplayNameService;
	private final RefreshSessionRepository refreshSessionRepository;
	private final ModerationActionRepository moderationActionRepository;

	public ModerationReportService(
			ForumPostReportRepository forumPostReportRepository,
			ForumCommentReportRepository forumCommentReportRepository,
			ForumPostRepository forumPostRepository,
			UserAccountRepository userAccountRepository,
			UserPublicDisplayNameService userPublicDisplayNameService,
			RefreshSessionRepository refreshSessionRepository,
			ModerationActionRepository moderationActionRepository) {
		this.forumPostReportRepository = forumPostReportRepository;
		this.forumCommentReportRepository = forumCommentReportRepository;
		this.forumPostRepository = forumPostRepository;
		this.userAccountRepository = userAccountRepository;
		this.userPublicDisplayNameService = userPublicDisplayNameService;
		this.refreshSessionRepository = refreshSessionRepository;
		this.moderationActionRepository = moderationActionRepository;
	}

	@Transactional
	public void lockPost(UUID postId, String userIdSubject) {
		UserAccount moderator = requireModerator(userIdSubject);
		ForumPost post = forumPostRepository.findById(postId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post not found"));

		if (post.isLocked()) {
			// Already locked - avoid a no-op save and a duplicate audit row.
			return;
		}

		post.lock();
		forumPostRepository.save(post);
		moderationActionRepository.save(ModerationAction.lock(moderator, postId, null));
		log.info("moderation.post_locked postId={} moderatorId={}", postId, moderator.getId());
	}

	@Transactional
	public void banUser(UUID targetUserId, String userIdSubject) {
		UserAccount moderator = requireModerator(userIdSubject);
		UserAccount targetUser = userAccountRepository.findById(targetUserId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

		if (roleRank(moderator) <= roleRank(targetUser)) {
			throw new ResponseStatusException(
					HttpStatus.FORBIDDEN,
					"You cannot ban a user with an equal or higher role.");
		}

		if (targetUser.getStatus() == UserStatus.BANNED) {
			return;
		}

		targetUser.ban();
		userAccountRepository.save(targetUser);
		refreshSessionRepository.revokeAllByUserId(targetUserId, Instant.now());
		moderationActionRepository.save(ModerationAction.ban(moderator, targetUserId, null));
		log.info("moderation.user_banned userId={} moderatorId={}", targetUserId, moderator.getId());
	}

	@Transactional(readOnly = true)
	public List<ModerationReportResponse> listReports(
			String targetType,
			String status,
			Integer limit,
			String userIdSubject) {
		requireModerator(userIdSubject);
		ModerationReportTargetType cleanedTargetType = parseTargetType(targetType);
		ForumReportStatus cleanedStatus = parseStatus(status);
		int cleanedLimit = cleanLimit(limit);
		PageRequest pageRequest = PageRequest.of(0, cleanedLimit);

		if (cleanedTargetType == ModerationReportTargetType.POST) {
			return findPostReports(cleanedStatus, pageRequest)
					.stream()
					.map(this::toResponse)
					.toList();
		}

		if (cleanedTargetType == ModerationReportTargetType.COMMENT) {
			return findCommentReports(cleanedStatus, pageRequest)
					.stream()
					.map(this::toResponse)
					.toList();
		}

		List<ModerationReportResponse> postReports = findPostReports(cleanedStatus, pageRequest)
				.stream()
				.map(this::toResponse)
				.toList();
		List<ModerationReportResponse> commentReports = findCommentReports(cleanedStatus, pageRequest)
				.stream()
				.map(this::toResponse)
				.toList();

		return java.util.stream.Stream.concat(postReports.stream(), commentReports.stream())
				.sorted((a, b) -> b.createdAt().compareTo(a.createdAt()))
				.limit(cleanedLimit)
				.toList();
	}

	@Transactional
	public ModerationReportResponse resolvePostReport(
			UUID reportId,
			ResolveModerationReportRequest request,
			String userIdSubject) {
		UserAccount moderator = requireModerator(userIdSubject);
		ForumPostReport report = forumPostReportRepository.findById(reportId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post report not found"));

		requireOpen(report.getStatus());
		report.close(toReportStatus(request.status()), moderator, cleanOptionalSingleLine(request.resolutionNote()));

		return toResponse(report);
	}

	@Transactional
	public ModerationReportResponse resolveCommentReport(
			UUID reportId,
			ResolveModerationReportRequest request,
			String userIdSubject) {
		UserAccount moderator = requireModerator(userIdSubject);
		ForumCommentReport report = forumCommentReportRepository.findById(reportId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum comment report not found"));

		requireOpen(report.getStatus());
		report.close(toReportStatus(request.status()), moderator, cleanOptionalSingleLine(request.resolutionNote()));

		return toResponse(report);
	}

	@Transactional
	public ModerationReportResponse hidePostFromReport(
			UUID reportId,
			HideModerationReportRequest request,
			String userIdSubject) {
		UserAccount moderator = requireModerator(userIdSubject);
		ForumPostReport report = forumPostReportRepository.findById(reportId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post report not found"));

		requireOpen(report.getStatus());
		String note = cleanOptionalSingleLine(request.resolutionNote());
		ForumPost post = report.getPost();
		post.hide();
		report.close(ForumReportStatus.RESOLVED, moderator, note);
		moderationActionRepository.save(ModerationAction.hidePost(moderator, post.getId(), note));
		log.info("moderation.post_hidden postId={} moderatorId={}", post.getId(), moderator.getId());

		return toResponse(report);
	}

	@Transactional
	public ModerationReportResponse hideCommentFromReport(
			UUID reportId,
			HideModerationReportRequest request,
			String userIdSubject) {
		UserAccount moderator = requireModerator(userIdSubject);
		ForumCommentReport report = forumCommentReportRepository.findById(reportId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum comment report not found"));

		requireOpen(report.getStatus());
		String note = cleanOptionalSingleLine(request.resolutionNote());
		ForumComment comment = report.getComment();
		comment.hide();
		report.close(ForumReportStatus.RESOLVED, moderator, note);
		moderationActionRepository.save(ModerationAction.hideComment(moderator, comment.getId(), note));
		log.info("moderation.comment_hidden commentId={} moderatorId={}", comment.getId(), moderator.getId());

		return toResponse(report);
	}

	private List<ForumPostReport> findPostReports(ForumReportStatus status, PageRequest pageRequest) {
		if (status == null) {
			return forumPostReportRepository.findAllByOrderByCreatedAtDesc(pageRequest);
		}

		return forumPostReportRepository.findByStatusOrderByCreatedAtDesc(status, pageRequest);
	}

	private List<ForumCommentReport> findCommentReports(ForumReportStatus status, PageRequest pageRequest) {
		if (status == null) {
			return forumCommentReportRepository.findAllByOrderByCreatedAtDesc(pageRequest);
		}

		return forumCommentReportRepository.findByStatusOrderByCreatedAtDesc(status, pageRequest);
	}

	private static int roleRank(UserAccount user) {
		return user.getRoles().stream()
				.mapToInt(ModerationReportService::roleRank)
				.max()
				.orElse(0);
	}

	private static int roleRank(UserRole role) {
		return switch (role) {
			case OWNER -> 3;
			case ADMIN -> 2;
			case MODERATOR -> 1;
			case USER -> 0;
		};
	}

	private static void requireOpen(ForumReportStatus status) {
		if (status != ForumReportStatus.OPEN) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "This report has already been resolved.");
		}
	}

	private UserAccount requireModerator(String userIdSubject) {
		UserAccount user = userAccountRepository.findById(parseUserIdSubject(userIdSubject))
				.orElseThrow(ModerationReportService::invalidAccessToken);

		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}

		if (user.getRoles().stream().noneMatch(MODERATION_ROLES::contains)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Moderator access required");
		}

		return user;
	}

	private ModerationReportResponse toResponse(ForumPostReport report) {
		ForumPost post = report.getPost();

		return new ModerationReportResponse(
				report.getId(),
				ModerationReportTargetType.POST,
				post.getId(),
				post.getId(),
				post.getTitle(),
				preview(post.getBody()),
				post.getAuthor().getId(),
				userPublicDisplayNameService.resolve(post.getAuthor()),
				report.getReporter().getId(),
				userPublicDisplayNameService.resolve(report.getReporter()),
				report.getReason(),
				report.getDetails(),
				report.getStatus(),
				report.getCreatedAt(),
				report.getResolvedAt(),
				report.getResolvedBy() == null ? null : report.getResolvedBy().getId(),
				report.getResolvedBy() == null ? null : userPublicDisplayNameService.resolve(report.getResolvedBy()),
				report.getResolutionNote());
	}

	private ModerationReportResponse toResponse(ForumCommentReport report) {
		ForumComment comment = report.getComment();
		ForumPost post = comment.getPost();

		return new ModerationReportResponse(
				report.getId(),
				ModerationReportTargetType.COMMENT,
				comment.getId(),
				post.getId(),
				post.getTitle(),
				preview(comment.getBody()),
				comment.getAuthor().getId(),
				userPublicDisplayNameService.resolve(comment.getAuthor()),
				report.getReporter().getId(),
				userPublicDisplayNameService.resolve(report.getReporter()),
				report.getReason(),
				report.getDetails(),
				report.getStatus(),
				report.getCreatedAt(),
				report.getResolvedAt(),
				report.getResolvedBy() == null ? null : report.getResolvedBy().getId(),
				report.getResolvedBy() == null ? null : userPublicDisplayNameService.resolve(report.getResolvedBy()),
				report.getResolutionNote());
	}

	private static ForumReportStatus toReportStatus(ModerationReportResolutionStatus status) {
		return switch (status) {
			case RESOLVED -> ForumReportStatus.RESOLVED;
			case DISMISSED -> ForumReportStatus.DISMISSED;
		};
	}

	private static ModerationReportTargetType parseTargetType(String targetType) {
		if (targetType == null || targetType.isBlank()) {
			return null;
		}

		try {
			return ModerationReportTargetType.valueOf(targetType.trim().toUpperCase(Locale.ROOT));
		}
		catch (RuntimeException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown moderation report target type");
		}
	}

	private static ForumReportStatus parseStatus(String status) {
		if (status == null || status.isBlank()) {
			return ForumReportStatus.OPEN;
		}

		if ("ALL".equalsIgnoreCase(status.trim())) {
			return null;
		}

		try {
			return ForumReportStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
		}
		catch (RuntimeException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown moderation report status");
		}
	}

	private static int cleanLimit(Integer limit) {
		if (limit == null) {
			return DEFAULT_LIMIT;
		}

		return Math.max(1, Math.min(limit, MAX_LIMIT));
	}

	private static String preview(String value) {
		String compact = value.trim().replaceAll("\\s+", " ");

		if (compact.length() <= PREVIEW_LIMIT) {
			return compact;
		}

		return compact.substring(0, PREVIEW_LIMIT) + "...";
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
