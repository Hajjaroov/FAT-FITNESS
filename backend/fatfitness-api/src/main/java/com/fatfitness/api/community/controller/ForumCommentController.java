package com.fatfitness.api.community.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.community.dto.CreateForumCommentRequest;
import com.fatfitness.api.community.dto.ForumCommentReportResponse;
import com.fatfitness.api.community.dto.ForumCommentResponse;
import com.fatfitness.api.community.dto.ReportForumCommentRequest;
import com.fatfitness.api.community.dto.UpdateForumCommentRequest;
import com.fatfitness.api.community.service.ForumCommentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/community")
public class ForumCommentController {

	private final ForumCommentService forumCommentService;

	public ForumCommentController(ForumCommentService forumCommentService) {
		this.forumCommentService = forumCommentService;
	}

	@GetMapping("/posts/{postId}/comments")
	public List<ForumCommentResponse> listComments(
			@PathVariable UUID postId,
			@RequestParam(required = false) Integer limit,
			@AuthenticationPrincipal Jwt jwt) {
		UUID currentUserId = jwt != null ? parseSubject(jwt.getSubject()) : null;
		return forumCommentService.listComments(postId, limit, currentUserId);
	}

	@PostMapping("/posts/{postId}/comments")
	@ResponseStatus(HttpStatus.CREATED)
	public ForumCommentResponse createComment(
			@PathVariable UUID postId,
			@Valid @RequestBody CreateForumCommentRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return forumCommentService.createComment(postId, request, jwt.getSubject());
	}

	@PatchMapping("/comments/{commentId}")
	public ForumCommentResponse updateComment(
			@PathVariable UUID commentId,
			@Valid @RequestBody UpdateForumCommentRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return forumCommentService.updateComment(commentId, request, jwt.getSubject());
	}

	@DeleteMapping("/comments/{commentId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteComment(
			@PathVariable UUID commentId,
			@AuthenticationPrincipal Jwt jwt) {
		forumCommentService.deleteComment(commentId, jwt.getSubject());
	}

	@PostMapping("/comments/{commentId}/reports")
	@ResponseStatus(HttpStatus.CREATED)
	public ForumCommentReportResponse reportComment(
			@PathVariable UUID commentId,
			@Valid @RequestBody ReportForumCommentRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return forumCommentService.reportComment(commentId, request, jwt.getSubject());
	}

	private static UUID parseSubject(String subject) {
		try {
			return UUID.fromString(subject);
		}
		catch (RuntimeException ex) {
			return null;
		}
	}
}
