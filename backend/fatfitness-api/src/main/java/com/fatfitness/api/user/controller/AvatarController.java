package com.fatfitness.api.user.controller;

import java.time.Instant;
import java.util.UUID;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.user.service.AvatarService;

@RestController
public class AvatarController {

	// Browsers may cache the avatar but must revalidate with If-None-Match; a 304
	// answer is version-check only (no blob read, no body), and a changed avatar
	// shows up immediately after upload.
	private static final CacheControl AVATAR_CACHE = CacheControl.noCache().cachePrivate();

	private final AvatarService avatarService;

	public AvatarController(AvatarService avatarService) {
		this.avatarService = avatarService;
	}

	@GetMapping("/api/avatars/{userId}")
	public ResponseEntity<byte[]> getAvatar(
			@PathVariable UUID userId,
			@RequestHeader(value = HttpHeaders.IF_NONE_MATCH, required = false) String ifNoneMatch) {
		Instant version = avatarService.getAvatarVersion(userId);
		String etag = "\"" + version.toEpochMilli() + "\"";

		if (etag.equals(ifNoneMatch)) {
			return ResponseEntity.status(HttpStatus.NOT_MODIFIED)
					.cacheControl(AVATAR_CACHE)
					.eTag(etag)
					.build();
		}

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
				.cacheControl(AVATAR_CACHE)
				.eTag(etag)
				.body(avatarService.getAvatarBytes(userId));
	}
}
