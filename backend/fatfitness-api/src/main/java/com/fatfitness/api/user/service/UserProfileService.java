package com.fatfitness.api.user.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.auth.repository.RefreshSessionRepository;
import com.fatfitness.api.auth.service.PasswordHashingService;
import com.fatfitness.api.user.dto.ChangePasswordRequest;
import com.fatfitness.api.user.dto.ChangePasswordResponse;
import com.fatfitness.api.user.dto.RevokeAllSessionsResponse;
import com.fatfitness.api.user.dto.UpdateNotificationPreferencesRequest;
import com.fatfitness.api.user.dto.UpdateNotificationPreferencesResponse;
import com.fatfitness.api.user.dto.UpdateProfileRequest;
import com.fatfitness.api.user.dto.UpdateProfileResponse;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Service
public class UserProfileService {

	private final UserAccountRepository userAccountRepository;
	private final PasswordHashingService passwordHashingService;
	private final RefreshSessionRepository refreshSessionRepository;

	public UserProfileService(
			UserAccountRepository userAccountRepository,
			PasswordHashingService passwordHashingService,
			RefreshSessionRepository refreshSessionRepository) {
		this.userAccountRepository = userAccountRepository;
		this.passwordHashingService = passwordHashingService;
		this.refreshSessionRepository = refreshSessionRepository;
	}

	@Transactional
	public UpdateProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
		UserAccount user = requireActiveUser(userId);
		user.updateProfile(request.displayName(), request.countryRegionCode());
		userAccountRepository.save(user);
		return new UpdateProfileResponse(user.getDisplayName(), user.getCountryRegionCode());
	}

	@Transactional
	public ChangePasswordResponse changePassword(UUID userId, ChangePasswordRequest request) {
		if (!request.newPassword().equals(request.confirmPassword())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
		}

		UserAccount user = requireActiveUser(userId);

		if (!passwordHashingService.matches(request.currentPassword(), user.getPasswordHash())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect.");
		}

		if (passwordHashingService.matches(request.newPassword(), user.getPasswordHash())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must differ from the current password.");
		}

		user.updatePasswordHash(passwordHashingService.hash(request.newPassword()));
		userAccountRepository.save(user);

		refreshSessionRepository.revokeAllByUserId(userId, Instant.now());

		return new ChangePasswordResponse("Password updated. You have been signed out of all devices.");
	}

	@Transactional
	public UpdateNotificationPreferencesResponse updateNotificationPreferences(
			UUID userId, UpdateNotificationPreferencesRequest request) {
		UserAccount user = requireActiveUser(userId);
		user.updateEmailNotificationsPm(request.emailNotificationsPm());
		userAccountRepository.save(user);
		return new UpdateNotificationPreferencesResponse(user.isEmailNotificationsPm());
	}

	@Transactional
	public RevokeAllSessionsResponse revokeAllSessions(UUID userId) {
		requireActiveUser(userId);
		refreshSessionRepository.revokeAllByUserId(userId, Instant.now());
		return new RevokeAllSessionsResponse("All sessions have been signed out.");
	}

	private UserAccount requireActiveUser(UUID userId) {
		UserAccount user = userAccountRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active.");
		}

		return user;
	}
}
