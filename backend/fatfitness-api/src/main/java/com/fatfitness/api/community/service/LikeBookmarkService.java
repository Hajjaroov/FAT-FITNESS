package com.fatfitness.api.community.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.community.dto.BookmarkToggleResponse;
import com.fatfitness.api.community.dto.ForumPostResponse;
import com.fatfitness.api.community.dto.LikeToggleResponse;
import com.fatfitness.api.community.entity.CommentLike;
import com.fatfitness.api.community.entity.ForumComment;
import com.fatfitness.api.community.entity.ForumCommentStatus;
import com.fatfitness.api.community.entity.ForumPost;
import com.fatfitness.api.community.entity.ForumPostStatus;
import com.fatfitness.api.community.entity.PostBookmark;
import com.fatfitness.api.community.entity.PostLike;
import com.fatfitness.api.community.repository.CommentLikeRepository;
import com.fatfitness.api.community.repository.ForumCommentRepository;
import com.fatfitness.api.community.repository.ForumPostRepository;
import com.fatfitness.api.community.repository.PostBookmarkRepository;
import com.fatfitness.api.community.repository.PostLikeRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Service
public class LikeBookmarkService {

	private final ForumPostRepository forumPostRepository;
	private final ForumCommentRepository forumCommentRepository;
	private final UserAccountRepository userAccountRepository;
	private final PostLikeRepository postLikeRepository;
	private final CommentLikeRepository commentLikeRepository;
	private final PostBookmarkRepository postBookmarkRepository;
	private final ForumPostService forumPostService;

	public LikeBookmarkService(
			ForumPostRepository forumPostRepository,
			ForumCommentRepository forumCommentRepository,
			UserAccountRepository userAccountRepository,
			PostLikeRepository postLikeRepository,
			CommentLikeRepository commentLikeRepository,
			PostBookmarkRepository postBookmarkRepository,
			ForumPostService forumPostService) {
		this.forumPostRepository = forumPostRepository;
		this.forumCommentRepository = forumCommentRepository;
		this.userAccountRepository = userAccountRepository;
		this.postLikeRepository = postLikeRepository;
		this.commentLikeRepository = commentLikeRepository;
		this.postBookmarkRepository = postBookmarkRepository;
		this.forumPostService = forumPostService;
	}

	@Transactional
	public LikeToggleResponse togglePostLike(UUID postId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		ForumPost post = forumPostRepository.findByIdAndStatus(postId, ForumPostStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post not found"));

		postLikeRepository.findByPostIdAndUserId(post.getId(), user.getId())
				.ifPresentOrElse(
						postLikeRepository::delete,
						() -> postLikeRepository.save(new PostLike(user, post)));

		long count = postLikeRepository.countByPostId(post.getId());
		boolean liked = postLikeRepository.findByPostIdAndUserId(post.getId(), user.getId()).isPresent();
		return new LikeToggleResponse(liked, count);
	}

	@Transactional
	public LikeToggleResponse toggleCommentLike(UUID commentId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		ForumComment comment = forumCommentRepository.findByIdAndStatus(commentId, ForumCommentStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum comment not found"));

		commentLikeRepository.findByCommentIdAndUserId(comment.getId(), user.getId())
				.ifPresentOrElse(
						commentLikeRepository::delete,
						() -> commentLikeRepository.save(new CommentLike(user, comment)));

		long count = commentLikeRepository.countByCommentId(comment.getId());
		boolean liked = commentLikeRepository.findByCommentIdAndUserId(comment.getId(), user.getId()).isPresent();
		return new LikeToggleResponse(liked, count);
	}

	@Transactional
	public BookmarkToggleResponse togglePostBookmark(UUID postId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);

		// Removing an existing bookmark is allowed regardless of post status so users
		// can unsave posts that have since been hidden or removed by moderation.
		postBookmarkRepository.findByPostIdAndUserId(postId, user.getId()).ifPresentOrElse(
				existing -> postBookmarkRepository.delete(existing),
				() -> {
					// No existing bookmark — only allow adding one for published posts.
					ForumPost post = forumPostRepository.findByIdAndStatus(postId, ForumPostStatus.PUBLISHED)
							.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post not found"));
					postBookmarkRepository.save(new PostBookmark(user, post));
				});

		boolean bookmarked = postBookmarkRepository.findByPostIdAndUserId(postId, user.getId()).isPresent();
		return new BookmarkToggleResponse(bookmarked);
	}

	@Transactional(readOnly = true)
	public List<ForumPostResponse> listBookmarkedPosts(String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		List<ForumPost> posts = postBookmarkRepository.findBookmarkedPostsByUserIdOrderByCreatedAtDesc(user.getId());
		return forumPostService.enrichAndMap(posts, user.getId());
	}

	private UserAccount requireActiveUser(String userIdSubject) {
		UserAccount user = userAccountRepository.findById(parseUserIdSubject(userIdSubject))
				.orElseThrow(LikeBookmarkService::invalidAccessToken);

		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}

		return user;
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
