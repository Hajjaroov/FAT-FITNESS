package com.fatfitness.api.auth.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.auth.dto.ForgotPasswordRequest;
import com.fatfitness.api.auth.dto.ForgotPasswordResponse;
import com.fatfitness.api.auth.dto.ResetPasswordRequest;
import com.fatfitness.api.auth.dto.ResetPasswordResponse;
import com.fatfitness.api.auth.model.PasswordResetToken;
import com.fatfitness.api.auth.repository.PasswordResetTokenRepository;
import com.fatfitness.api.auth.repository.RefreshSessionRepository;
import com.fatfitness.api.email.EmailService;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Service
public class PasswordResetService {

	private static final Duration TOKEN_TTL = Duration.ofMinutes(30);
	private static final String SAFE_RESPONSE =
			"If an active account exists for this email, a password reset link has been sent.";

	private final UserAccountRepository userAccountRepository;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final RefreshSessionRepository refreshSessionRepository;
	private final PasswordHashingService passwordHashingService;
	private final SecureTokenService secureTokenService;
	private final EmailService emailService;

	public PasswordResetService(
			UserAccountRepository userAccountRepository,
			PasswordResetTokenRepository passwordResetTokenRepository,
			RefreshSessionRepository refreshSessionRepository,
			PasswordHashingService passwordHashingService,
			SecureTokenService secureTokenService,
			EmailService emailService) {
		this.userAccountRepository = userAccountRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.refreshSessionRepository = refreshSessionRepository;
		this.passwordHashingService = passwordHashingService;
		this.secureTokenService = secureTokenService;
		this.emailService = emailService;
	}

	@Transactional
	public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
		String email = request.email().trim().toLowerCase(Locale.ROOT);
		UserAccount user = userAccountRepository.findByEmail(email).orElse(null);

		if (user == null || user.getStatus() != UserStatus.ACTIVE) {
			return new ForgotPasswordResponse(SAFE_RESPONSE);
		}

		String rawToken = secureTokenService.generateToken();
		String tokenHash = secureTokenService.hashToken(rawToken);
		Instant expiresAt = Instant.now().plus(TOKEN_TTL);
		passwordResetTokenRepository.save(new PasswordResetToken(user, tokenHash, expiresAt));

		emailService.sendPasswordResetEmail(user.getEmail(), user.getDisplayName(), rawToken);

		return new ForgotPasswordResponse(SAFE_RESPONSE);
	}

	@Transactional
	public ResetPasswordResponse resetPassword(ResetPasswordRequest request) {
		if (!request.newPassword().equals(request.confirmPassword())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password confirmation does not match");
		}

		String tokenHash = secureTokenService.hashToken(request.token().trim());
		PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset link"));

		if (resetToken.getUsedAt() != null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This reset link has already been used");
		}

		if (!resetToken.getExpiresAt().isAfter(Instant.now())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This reset link has expired");
		}

		UserAccount user = resetToken.getUser();
		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}

		user.updatePasswordHash(passwordHashingService.hash(request.newPassword()));
		resetToken.markUsed();

		// Revoke all existing refresh sessions so all devices must re-login
		refreshSessionRepository.revokeAllByUserId(user.getId(), Instant.now());

		return new ResetPasswordResponse("Password updated. Please sign in with your new password.");
	}
}
