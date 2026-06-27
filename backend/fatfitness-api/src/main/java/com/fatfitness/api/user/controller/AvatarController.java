package com.fatfitness.api.user.controller;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.user.service.AvatarService;

@RestController
public class AvatarController {

	private final AvatarService avatarService;

	public AvatarController(AvatarService avatarService) {
		this.avatarService = avatarService;
	}

	@GetMapping("/api/avatars/{userId}")
	public ResponseEntity<byte[]> getAvatar(@PathVariable UUID userId) {
		byte[] avatar = avatarService.getAvatar(userId);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
				.header(HttpHeaders.CACHE_CONTROL, "no-store")
				.body(avatar);
	}
}
