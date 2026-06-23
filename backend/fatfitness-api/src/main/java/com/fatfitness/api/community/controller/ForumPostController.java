package com.fatfitness.api.community.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.community.dto.CreateForumPostRequest;
import com.fatfitness.api.community.dto.ForumPostReportResponse;
import com.fatfitness.api.community.dto.ForumPostResponse;
import com.fatfitness.api.community.dto.ReportForumPostRequest;
import com.fatfitness.api.community.service.ForumPostService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/community/posts")
public class ForumPostController {

	private final ForumPostService forumPostService;

	public ForumPostController(ForumPostService forumPostService) {
		this.forumPostService = forumPostService;
	}

	@GetMapping
	public List<ForumPostResponse> listPosts(
			@RequestParam(required = false) String categorySlug,
			@RequestParam(required = false) Integer limit,
			@AuthenticationPrincipal Jwt jwt) {
		UUID currentUserId = jwt != null ? parseSubject(jwt.getSubject()) : null;
		return forumPostService.listPosts(categorySlug, limit, currentUserId);
	}

	@GetMapping("/{postId}")
	public ForumPostResponse getPost(
			@PathVariable UUID postId,
			@AuthenticationPrincipal Jwt jwt) {
		UUID currentUserId = jwt != null ? parseSubject(jwt.getSubject()) : null;
		return forumPostService.getPost(postId, currentUserId);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ForumPostResponse createPost(
			@Valid @RequestBody CreateForumPostRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return forumPostService.createPost(request, jwt.getSubject());
	}

	@PostMapping("/{postId}/reports")
	@ResponseStatus(HttpStatus.CREATED)
	public ForumPostReportResponse reportPost(
			@PathVariable UUID postId,
			@Valid @RequestBody ReportForumPostRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return forumPostService.reportPost(postId, request, jwt.getSubject());
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
