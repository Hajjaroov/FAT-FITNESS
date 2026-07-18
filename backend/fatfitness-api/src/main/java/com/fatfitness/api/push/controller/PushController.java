package com.fatfitness.api.push.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.push.dto.SubscribePushRequest;
import com.fatfitness.api.push.dto.UnsubscribePushRequest;
import com.fatfitness.api.push.service.PushSubscriptionService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/push/subscriptions")
public class PushController {

	private final PushSubscriptionService pushSubscriptionService;

	public PushController(PushSubscriptionService pushSubscriptionService) {
		this.pushSubscriptionService = pushSubscriptionService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public void subscribe(
			@Valid @RequestBody SubscribePushRequest request,
			@AuthenticationPrincipal Jwt jwt,
			HttpServletRequest servletRequest) {
		pushSubscriptionService.subscribe(request, jwt.getSubject(), servletRequest.getHeader("User-Agent"));
	}

	@DeleteMapping
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void unsubscribe(@Valid @RequestBody UnsubscribePushRequest request, @AuthenticationPrincipal Jwt jwt) {
		pushSubscriptionService.unsubscribe(request, jwt.getSubject());
	}
}
