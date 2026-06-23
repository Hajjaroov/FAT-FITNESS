package com.fatfitness.api.community.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.community.dto.BookmarkToggleResponse;
import com.fatfitness.api.community.dto.ForumPostResponse;
import com.fatfitness.api.community.dto.LikeToggleResponse;
import com.fatfitness.api.community.service.LikeBookmarkService;

@RestController
@RequestMapping("/api/community")
public class LikeBookmarkController {

	private final LikeBookmarkService likeBookmarkService;

	public LikeBookmarkController(LikeBookmarkService likeBookmarkService) {
		this.likeBookmarkService = likeBookmarkService;
	}

	@PostMapping("/posts/{postId}/like")
	public LikeToggleResponse togglePostLike(@PathVariable UUID postId, @AuthenticationPrincipal Jwt jwt) {
		return likeBookmarkService.togglePostLike(postId, jwt.getSubject());
	}

	@PostMapping("/comments/{commentId}/like")
	public LikeToggleResponse toggleCommentLike(@PathVariable UUID commentId, @AuthenticationPrincipal Jwt jwt) {
		return likeBookmarkService.toggleCommentLike(commentId, jwt.getSubject());
	}

	@PostMapping("/posts/{postId}/bookmark")
	public BookmarkToggleResponse togglePostBookmark(@PathVariable UUID postId, @AuthenticationPrincipal Jwt jwt) {
		return likeBookmarkService.togglePostBookmark(postId, jwt.getSubject());
	}

	@GetMapping("/bookmarks")
	public List<ForumPostResponse> listBookmarkedPosts(@AuthenticationPrincipal Jwt jwt) {
		return likeBookmarkService.listBookmarkedPosts(jwt.getSubject());
	}
}
