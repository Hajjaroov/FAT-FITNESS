package com.fatfitness.api.moderation.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.moderation.dto.HideModerationReportRequest;
import com.fatfitness.api.moderation.dto.ModerationReportResponse;
import com.fatfitness.api.moderation.dto.ResolveModerationReportRequest;
import com.fatfitness.api.moderation.service.ModerationReportService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/moderation/reports")
public class ModerationReportController {

	private final ModerationReportService moderationReportService;

	public ModerationReportController(ModerationReportService moderationReportService) {
		this.moderationReportService = moderationReportService;
	}

	@GetMapping
	public List<ModerationReportResponse> listReports(
			@RequestParam(required = false) String targetType,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) Integer limit,
			@AuthenticationPrincipal Jwt jwt) {
		return moderationReportService.listReports(targetType, status, limit, jwt.getSubject());
	}

	@PostMapping("/posts/{reportId}/resolve")
	public ModerationReportResponse resolvePostReport(
			@PathVariable UUID reportId,
			@Valid @RequestBody ResolveModerationReportRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return moderationReportService.resolvePostReport(reportId, request, jwt.getSubject());
	}

	@PostMapping("/posts/{reportId}/hide")
	public ModerationReportResponse hidePostFromReport(
			@PathVariable UUID reportId,
			@Valid @RequestBody HideModerationReportRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return moderationReportService.hidePostFromReport(reportId, request, jwt.getSubject());
	}

	@PostMapping("/comments/{reportId}/resolve")
	public ModerationReportResponse resolveCommentReport(
			@PathVariable UUID reportId,
			@Valid @RequestBody ResolveModerationReportRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return moderationReportService.resolveCommentReport(reportId, request, jwt.getSubject());
	}

	@PostMapping("/comments/{reportId}/hide")
	public ModerationReportResponse hideCommentFromReport(
			@PathVariable UUID reportId,
			@Valid @RequestBody HideModerationReportRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return moderationReportService.hideCommentFromReport(reportId, request, jwt.getSubject());
	}
}
