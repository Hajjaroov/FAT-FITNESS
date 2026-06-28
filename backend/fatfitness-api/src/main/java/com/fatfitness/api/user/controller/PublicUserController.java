package com.fatfitness.api.user.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.user.dto.PublicUserProfileResponse;
import com.fatfitness.api.user.service.PublicUserProfileService;

@RestController
@RequestMapping("/api/users")
public class PublicUserController {

	private final PublicUserProfileService publicUserProfileService;

	public PublicUserController(PublicUserProfileService publicUserProfileService) {
		this.publicUserProfileService = publicUserProfileService;
	}

	@GetMapping("/{userId}/profile")
	public PublicUserProfileResponse getProfile(@PathVariable UUID userId) {
		return publicUserProfileService.getProfile(userId);
	}
}
