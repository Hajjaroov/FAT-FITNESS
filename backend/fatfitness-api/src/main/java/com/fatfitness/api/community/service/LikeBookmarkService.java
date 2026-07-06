package com.fatfitness.api.community.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
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

		Optional<PostLike> existing = postLikeRepository.findByPostIdAndUserId(post.getId(), user.getId());
		boolean liked;
		if (existing.isPresent()) {
			postLikeRepository.delete(existing.get());
			liked = false;
		}
		else {
			liked = true;
			try {
				// saveAndFlush so a concurrent duplicate-like insert (e.g. a fast
				// double-click) surfaces here rather than later at commit time,
				// where it could no longer be treated as a harmless race.
				postLikeRepository.saveAndFlush(new PostLike(user, post));
			}
			catch (DataIntegrityViolationException ex) {
				// Another concurrent request already created this like - fine, the
				// end state (liked = true) is the same either way.
			}
		}

		long count = postLikeRepository.countByPostId(post.getId());
		return new LikeToggleResponse(liked, count);
	}

	@Transactional
	public LikeToggleResponse toggleCommentLike(UUID commentId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		ForumComment comment = forumCommentRepository.findByIdAndStatus(commentId, ForumCommentStatus.PUBLISHED)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum comment not found"));

		Optional<CommentLike> existing = commentLikeRepository.findByCommentIdAndUserId(comment.getId(), user.getId());
		boolean liked;
		if (existing.isPresent()) {
			commentLikeRepository.delete(existing.get());
			liked = false;
		}
		else {
			liked = true;
			try {
				commentLikeRepository.saveAndFlush(new CommentLike(user, comment));
			}
			catch (DataIntegrityViolationException ex) {
				// Another concurrent request already created this like.
			}
		}

		long count = commentLikeRepository.countByCommentId(comment.getId());
		return new LikeToggleResponse(liked, count);
	}

	@Transactional
	public BookmarkToggleResponse togglePostBookmark(UUID postId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);

		// Removing an existing bookmark is allowed regardless of post status so users
		// can unsave posts that have since been hidden or removed by moderation.
		Optional<PostBookmark> existing = postBookmarkRepository.findByPostIdAndUserId(postId, user.getId());
		boolean bookmarked;
		if (existing.isPresent()) {
			postBookmarkRepository.delete(existing.get());
			bookmarked = false;
		}
		else {
			// No existing bookmark — only allow adding one for published posts.
			ForumPost post = forumPostRepository.findByIdAndStatus(postId, ForumPostStatus.PUBLISHED)
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum post not found"));
			bookmarked = true;
			try {
				postBookmarkRepository.saveAndFlush(new PostBookmark(user, post));
			}
			catch (DataIntegrityViolationException ex) {
				// Another concurrent request already created this bookmark.
			}
		}

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
