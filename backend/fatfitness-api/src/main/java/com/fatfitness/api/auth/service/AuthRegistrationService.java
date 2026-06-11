package com.fatfitness.api.auth.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.config.AuthProperties;
import com.fatfitness.api.auth.dto.LoginRequest;
import com.fatfitness.api.auth.dto.LoginResponse;
import com.fatfitness.api.auth.dto.RefreshRequest;
import com.fatfitness.api.auth.dto.RefreshResponse;
import com.fatfitness.api.auth.dto.ResendVerificationRequest;
import com.fatfitness.api.auth.dto.ResendVerificationResponse;
import com.fatfitness.api.auth.dto.RegisterRequest;
import com.fatfitness.api.auth.dto.RegisterResponse;
import com.fatfitness.api.auth.dto.VerifyEmailRequest;
import com.fatfitness.api.auth.dto.VerifyEmailResponse;
import com.fatfitness.api.auth.service.EmailVerificationTokenService.CreatedEmailVerificationToken;
import com.fatfitness.api.auth.service.JwtAccessTokenService.CreatedAccessToken;
import com.fatfitness.api.auth.model.RefreshSession;
import com.fatfitness.api.auth.repository.RefreshSessionRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Service
public class AuthRegistrationService {

	private final UserAccountRepository userAccountRepository;
	private final PasswordHashingService passwordHashingService;
	private final EmailVerificationTokenService emailVerificationTokenService;
	private final RefreshSessionRepository refreshSessionRepository;
	private final JwtAccessTokenService jwtAccessTokenService;
	private final SecureTokenService secureTokenService;
	private final Duration refreshTokenTtl;

	public AuthRegistrationService(
			UserAccountRepository userAccountRepository,
			PasswordHashingService passwordHashingService,
			EmailVerificationTokenService emailVerificationTokenService,
			RefreshSessionRepository refreshSessionRepository,
			JwtAccessTokenService jwtAccessTokenService,
			SecureTokenService secureTokenService,
			AuthProperties authProperties) {
		this.userAccountRepository = userAccountRepository;
		this.passwordHashingService = passwordHashingService;
		this.emailVerificationTokenService = emailVerificationTokenService;
		this.refreshSessionRepository = refreshSessionRepository;
		this.jwtAccessTokenService = jwtAccessTokenService;
		this.secureTokenService = secureTokenService;
		this.refreshTokenTtl = authProperties.refreshTokenTtl();
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

	@Transactional
	public ResendVerificationResponse resendVerification(ResendVerificationRequest request) {
		String email = normalizeEmail(request.email());
		UserAccount user = userAccountRepository.findByEmail(email).orElse(null);

		if (user == null || user.getStatus() != UserStatus.PENDING_EMAIL_VERIFICATION) {
			return new ResendVerificationResponse(
					"If an unverified account exists for this email, a verification link will be sent.",
					null,
					null);
		}

		CreatedEmailVerificationToken verificationToken = emailVerificationTokenService.createFor(user);

		return new ResendVerificationResponse(
				"Verification token created. Real email delivery is not enabled yet.",
				verificationToken.rawToken(),
				verificationToken.expiresAt());
	}

	@Transactional
	public LoginResponse login(LoginRequest request, String userAgent, String ipAddress) {
		String email = normalizeEmail(request.email());
		UserAccount user = userAccountRepository.findByEmail(email)
				.orElseThrow(AuthRegistrationService::invalidCredentials);

		if (!passwordHashingService.matches(request.password(), user.getPasswordHash())) {
			throw invalidCredentials();
		}

		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}

		CreatedAccessToken accessToken = jwtAccessTokenService.createFor(user);
		String rawRefreshToken = secureTokenService.generateToken();
		Instant refreshExpiresAt = Instant.now().plus(refreshTokenTtl);
		RefreshSession refreshSession = new RefreshSession(
				user,
				secureTokenService.hashToken(rawRefreshToken),
				request.clientType(),
				refreshExpiresAt);
		refreshSession.setClientMetadata(
				cleanOptional(request.deviceLabel(), 120),
				cleanOptional(userAgent, 512),
				cleanOptional(ipAddress, 45));

		refreshSessionRepository.save(refreshSession);
		user.recordLogin();

		return new LoginResponse(
				user.getId(),
				user.getEmail(),
				user.getDisplayName(),
				user.getRoles(),
				"Bearer",
				accessToken.token(),
				accessToken.expiresAt(),
				rawRefreshToken,
				refreshExpiresAt);
	}

	@Transactional
	public RefreshResponse refresh(RefreshRequest request, String userAgent, String ipAddress) {
		RefreshSession currentSession = refreshSessionRepository
				.findByRefreshTokenHash(secureTokenService.hashToken(request.refreshToken()))
				.orElseThrow(AuthRegistrationService::invalidRefreshToken);

		if (currentSession.getRevokedAt() != null) {
			throw invalidRefreshToken();
		}

		if (!currentSession.getExpiresAt().isAfter(Instant.now())) {
			currentSession.revoke();
			throw invalidRefreshToken();
		}

		UserAccount user = currentSession.getUser();
		if (user.getStatus() != UserStatus.ACTIVE) {
			currentSession.revoke();
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}

		currentSession.recordUse();
		CreatedAccessToken accessToken = jwtAccessTokenService.createFor(user);
		String rawRefreshToken = secureTokenService.generateToken();
		Instant refreshExpiresAt = Instant.now().plus(refreshTokenTtl);
		RefreshSession replacementSession = new RefreshSession(
				user,
				secureTokenService.hashToken(rawRefreshToken),
				currentSession.getClientType(),
				refreshExpiresAt);
		replacementSession.setClientMetadata(
				currentSession.getDeviceLabel(),
				cleanOptionalOrFallback(userAgent, 512, currentSession.getUserAgent()),
				cleanOptionalOrFallback(ipAddress, 45, currentSession.getIpAddress()));

		refreshSessionRepository.save(replacementSession);
		currentSession.replaceWith(replacementSession);

		return new RefreshResponse(
				"Bearer",
				accessToken.token(),
				accessToken.expiresAt(),
				rawRefreshToken,
				refreshExpiresAt);
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

	private static String cleanOptional(String value, int maxLength) {
		if (value == null) {
			return null;
		}

		String cleaned = value.trim();
		if (cleaned.isEmpty()) {
			return null;
		}

		return cleaned.length() <= maxLength ? cleaned : cleaned.substring(0, maxLength);
	}

	private static String cleanOptionalOrFallback(String value, int maxLength, String fallback) {
		String cleaned = cleanOptional(value, maxLength);
		return cleaned == null ? fallback : cleaned;
	}

	private static ResponseStatusException invalidCredentials() {
		return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
	}

	private static ResponseStatusException invalidRefreshToken() {
		return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
	}
}
