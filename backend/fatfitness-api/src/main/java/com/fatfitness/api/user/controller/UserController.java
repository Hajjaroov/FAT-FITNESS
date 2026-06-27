package com.fatfitness.api.user.controller;

import java.io.IOException;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fatfitness.api.user.dto.ChangePasswordRequest;
import com.fatfitness.api.user.dto.ChangePasswordResponse;
import com.fatfitness.api.user.dto.RevokeAllSessionsResponse;
import com.fatfitness.api.user.dto.UpdateProfileRequest;
import com.fatfitness.api.user.dto.UpdateProfileResponse;
import com.fatfitness.api.user.service.AvatarService;
import com.fatfitness.api.user.service.UserProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

	private final UserProfileService userProfileService;
	private final AvatarService avatarService;

	public UserController(UserProfileService userProfileService, AvatarService avatarService) {
		this.userProfileService = userProfileService;
		this.avatarService = avatarService;
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

	@PostMapping("/avatar")
	public ResponseEntity<Void> uploadAvatar(
			@AuthenticationPrincipal Jwt jwt,
			@RequestParam("avatar") MultipartFile file) throws IOException {
		avatarService.uploadAvatar(UUID.fromString(jwt.getSubject()), file);
		return ResponseEntity.noContent().build();
	}
}
