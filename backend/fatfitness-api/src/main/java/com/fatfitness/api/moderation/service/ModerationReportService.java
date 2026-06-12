package com.fatfitness.api.moderation.service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

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

	private static final int DEFAULT_LIMIT = 50;
	private static final int MAX_LIMIT = 100;
	private static final int PREVIEW_LIMIT = 220;
	private static final Set<UserRole> MODERATION_ROLES = Set.of(
			UserRole.OWNER,
			UserRole.ADMIN,
			UserRole.MODERATOR);

	private final ForumPostReportRepository forumPostReportRepository;
	private final ForumCommentReportRepository forumCommentReportRepository;
	private final UserAccountRepository userAccountRepository;
	private final UserPublicDisplayNameService userPublicDisplayNameService;

	public ModerationReportService(
			ForumPostReportRepository forumPostReportRepository,
			ForumCommentReportRepository forumCommentReportRepository,
			UserAccountRepository userAccountRepository,
			UserPublicDisplayNameService userPublicDisplayNameService) {
		this.forumPostReportRepository = forumPostReportRepository;
		this.forumCommentReportRepository = forumCommentReportRepository;
		this.userAccountRepository = userAccountRepository;
		this.userPublicDisplayNameService = userPublicDisplayNameService;
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
				.sorted(Comparator.comparing(ModerationReportResponse::createdAt).reversed())
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

		report.close(toReportStatus(request.status()), moderator, cleanOptionalSingleLine(request.resolutionNote()));

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
