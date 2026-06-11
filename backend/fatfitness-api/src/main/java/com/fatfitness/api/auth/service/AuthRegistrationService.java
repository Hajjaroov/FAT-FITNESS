package com.fatfitness.api.auth.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.auth.dto.RegisterRequest;
import com.fatfitness.api.auth.dto.RegisterResponse;
import com.fatfitness.api.auth.dto.VerifyEmailRequest;
import com.fatfitness.api.auth.dto.VerifyEmailResponse;
import com.fatfitness.api.auth.service.EmailVerificationTokenService.CreatedEmailVerificationToken;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Service
public class AuthRegistrationService {

	private final UserAccountRepository userAccountRepository;
	private final PasswordHashingService passwordHashingService;
	private final EmailVerificationTokenService emailVerificationTokenService;

	public AuthRegistrationService(
			UserAccountRepository userAccountRepository,
			PasswordHashingService passwordHashingService,
			EmailVerificationTokenService emailVerificationTokenService) {
		this.userAccountRepository = userAccountRepository;
		this.passwordHashingService = passwordHashingService;
		this.emailVerificationTokenService = emailVerificationTokenService;
	}

	@Transactional
	public RegisterResponse register(RegisterRequest request) {
		if (!request.password().equals(request.confirmPassword())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password confirmation does not match");
		}

		String email = normalizeEmail(request.email());

		if (userAccountRepository.existsByEmail(email)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
		}

		UserAccount user = userAccountRepository.save(new UserAccount(
				email,
				cleanDisplayName(request.displayName()),
				normalizeCountryRegionCode(request.countryRegionCode()),
				passwordHashingService.hash(request.password())));
		CreatedEmailVerificationToken verificationToken = emailVerificationTokenService.createFor(user);

		return new RegisterResponse(
				user.getId(),
				user.getEmail(),
				user.getStatus(),
				"Account created. Verify email before posting or using account-only community features.",
				verificationToken.rawToken(),
				verificationToken.expiresAt());
	}

	@Transactional
	public VerifyEmailResponse verifyEmail(VerifyEmailRequest request) {
		UserAccount user = emailVerificationTokenService.verify(request.token());

		return new VerifyEmailResponse(
				user.getId(),
				user.getEmail(),
				user.getStatus(),
				user.getEmailVerifiedAt(),
				"Email verified. Account-only community features can use this account when they are available.");
	}

	private static String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private static String normalizeCountryRegionCode(String countryRegionCode) {
		return countryRegionCode.trim().toUpperCase(Locale.ROOT);
	}

	private static String cleanDisplayName(String displayName) {
		return displayName.trim().replaceAll("\\s+", " ");
	}
}
