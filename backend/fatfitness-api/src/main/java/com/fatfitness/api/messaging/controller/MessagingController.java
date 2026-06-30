package com.fatfitness.api.messaging.controller;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.auth.service.InMemoryRateLimiter;
import com.fatfitness.api.messaging.dto.BroadcastMessageRequest;
import com.fatfitness.api.messaging.dto.BroadcastMessageResponse;
import com.fatfitness.api.messaging.dto.ConversationSummaryResponse;
import com.fatfitness.api.messaging.dto.ConversationThreadResponse;
import com.fatfitness.api.messaging.dto.MessageResponse;
import com.fatfitness.api.messaging.dto.ReplyMessageRequest;
import com.fatfitness.api.messaging.dto.StartConversationRequest;
import com.fatfitness.api.messaging.dto.UnreadCountResponse;
import com.fatfitness.api.messaging.service.MessagingService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/messages")
public class MessagingController {

	private static final int START_MAX = 20;
	private static final Duration START_WINDOW = Duration.ofHours(1);

	private static final int REPLY_MAX = 60;
	private static final Duration REPLY_WINDOW = Duration.ofMinutes(10);

	private final MessagingService messagingService;
	private final InMemoryRateLimiter rateLimiter;

	public MessagingController(MessagingService messagingService, InMemoryRateLimiter rateLimiter) {
		this.messagingService = messagingService;
		this.rateLimiter = rateLimiter;
	}

	@GetMapping
	public List<ConversationSummaryResponse> listInbox(@AuthenticationPrincipal Jwt jwt) {
		return messagingService.listInbox(jwt.getSubject());
	}

	@GetMapping("/unread-count")
	public UnreadCountResponse unreadCount(@AuthenticationPrincipal Jwt jwt) {
		return messagingService.unreadCount(jwt.getSubject());
	}

	@GetMapping("/{conversationId}")
	public ConversationThreadResponse getThread(
			@PathVariable UUID conversationId,
			@AuthenticationPrincipal Jwt jwt) {
		return messagingService.getThread(conversationId, jwt.getSubject());
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ConversationThreadResponse startConversation(
			@Valid @RequestBody StartConversationRequest request,
			@AuthenticationPrincipal Jwt jwt,
			HttpServletRequest servletRequest) {
		rateLimiter.check("message-start:" + servletRequest.getRemoteAddr(), START_MAX, START_WINDOW);
		return messagingService.startConversation(request, jwt.getSubject());
	}

	@PostMapping("/broadcast")
	@ResponseStatus(HttpStatus.CREATED)
	public BroadcastMessageResponse broadcast(
			@Valid @RequestBody BroadcastMessageRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return messagingService.broadcast(request, jwt.getSubject());
	}

	@PostMapping("/{conversationId}/reply")
	@ResponseStatus(HttpStatus.CREATED)
	public MessageResponse reply(
			@PathVariable UUID conversationId,
			@Valid @RequestBody ReplyMessageRequest request,
			@AuthenticationPrincipal Jwt jwt,
			HttpServletRequest servletRequest) {
		rateLimiter.check("message-reply:" + servletRequest.getRemoteAddr(), REPLY_MAX, REPLY_WINDOW);
		return messagingService.reply(conversationId, request, jwt.getSubject());
	}

	@DeleteMapping("/{conversationId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteConversation(
			@PathVariable UUID conversationId,
			@AuthenticationPrincipal Jwt jwt) {
		messagingService.deleteConversation(conversationId, jwt.getSubject());
	}
}
