package com.fatfitness.api.moderation.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.moderation.service.ModerationReportService;

@RestController
@RequestMapping("/api/moderation")
public class ModerationActionController {

    private final ModerationReportService moderationReportService;

    public ModerationActionController(ModerationReportService moderationReportService) {
        this.moderationReportService = moderationReportService;
    }

    @PostMapping("/posts/{postId}/lock")
    @ResponseStatus(HttpStatus.OK)
    public void lockPost(@PathVariable UUID postId, @AuthenticationPrincipal Jwt jwt) {
        moderationReportService.lockPost(postId, jwt.getSubject());
    }

    @PostMapping("/users/{userId}/ban")
    @ResponseStatus(HttpStatus.OK)
    public void banUser(@PathVariable UUID userId, @AuthenticationPrincipal Jwt jwt) {
        moderationReportService.banUser(userId, jwt.getSubject());
    }
}
