package com.fatfitness.api.user.controller;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.user.dto.ChangePasswordRequest;
import com.fatfitness.api.user.dto.ChangePasswordResponse;
import com.fatfitness.api.user.dto.RevokeAllSessionsResponse;
import com.fatfitness.api.user.dto.UpdateProfileRequest;
import com.fatfitness.api.user.dto.UpdateProfileResponse;
import com.fatfitness.api.user.service.UserProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

	private final UserProfileService userProfileService;

	public UserController(UserProfileService userProfileService) {
		this.userProfileService = userProfileService;
	}

	@PatchMapping("/profile")
	public UpdateProfileResponse updateProfile(
			@AuthenticationPrincipal Jwt jwt,
			@Valid @RequestBody UpdateProfileRequest request) {
		return userProfileService.updateProfile(UUID.fromString(jwt.getSubject()), request);
	}

	@PostMapping("/change-password")
	public ChangePasswordResponse changePassword(
			@AuthenticationPrincipal Jwt jwt,
			@Valid @RequestBody ChangePasswordRequest request) {
		return userProfileService.changePassword(UUID.fromString(jwt.getSubject()), request);
	}

	@PostMapping("/sessions/revoke-all")
	public RevokeAllSessionsResponse revokeAllSessions(@AuthenticationPrincipal Jwt jwt) {
		return userProfileService.revokeAllSessions(UUID.fromString(jwt.getSubject()));
	}
}
