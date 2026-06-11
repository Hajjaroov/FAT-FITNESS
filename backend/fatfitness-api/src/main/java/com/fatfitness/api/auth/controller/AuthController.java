package com.fatfitness.api.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.auth.dto.CurrentUserResponse;
import com.fatfitness.api.auth.dto.LoginRequest;
import com.fatfitness.api.auth.dto.LoginResponse;
import com.fatfitness.api.auth.dto.LogoutRequest;
import com.fatfitness.api.auth.dto.LogoutResponse;
import com.fatfitness.api.auth.dto.RefreshRequest;
import com.fatfitness.api.auth.dto.RefreshResponse;
import com.fatfitness.api.auth.dto.ResendVerificationRequest;
import com.fatfitness.api.auth.dto.ResendVerificationResponse;
import com.fatfitness.api.auth.dto.RegisterRequest;
import com.fatfitness.api.auth.dto.RegisterResponse;
import com.fatfitness.api.auth.dto.VerifyEmailRequest;
import com.fatfitness.api.auth.dto.VerifyEmailResponse;
import com.fatfitness.api.auth.model.ClientType;
import com.fatfitness.api.auth.service.AuthRegistrationService;
import com.fatfitness.api.auth.service.RefreshTokenCookieService;
import com.fatfitness.api.auth.service.RefreshTokenCookieService.ResolvedRefreshToken;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthRegistrationService authRegistrationService;
	private final RefreshTokenCookieService refreshTokenCookieService;

	public AuthController(
			AuthRegistrationService authRegistrationService,
			RefreshTokenCookieService refreshTokenCookieService) {
		this.authRegistrationService = authRegistrationService;
		this.refreshTokenCookieService = refreshTokenCookieService;
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
		return authRegistrationService.register(request);
	}

	@PostMapping("/verify-email")
	public VerifyEmailResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
		return authRegistrationService.verifyEmail(request);
	}

	@PostMapping("/resend-verification")
	public ResendVerificationResponse resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
		return authRegistrationService.resendVerification(request);
	}

	@PostMapping("/login")
	public LoginResponse login(
			@Valid @RequestBody LoginRequest request,
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) {
		LoginResponse response = authRegistrationService.login(
				request,
				servletRequest.getHeader("User-Agent"),
				servletRequest.getRemoteAddr());

		if (request.clientType() == ClientType.WEB) {
			refreshTokenCookieService.addRefreshTokenCookie(
					servletResponse,
					response.refreshToken(),
					response.refreshTokenExpiresAt());
			return withoutRefreshToken(response);
		}

		return response;
	}

	@PostMapping("/refresh")
	public RefreshResponse refresh(
			@RequestBody(required = false) RefreshRequest request,
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) {
		ResolvedRefreshToken refreshToken = refreshTokenCookieService.resolveRefreshToken(
				request == null ? null : request.refreshToken(),
				servletRequest);
		RefreshResponse response = authRegistrationService.refresh(
				refreshToken.token(),
				servletRequest.getHeader("User-Agent"),
				servletRequest.getRemoteAddr());

		if (refreshToken.fromCookie()) {
			refreshTokenCookieService.addRefreshTokenCookie(
					servletResponse,
					response.refreshToken(),
					response.refreshTokenExpiresAt());
			return withoutRefreshToken(response);
		}

		return response;
	}

	@PostMapping("/logout")
	public LogoutResponse logout(
			@RequestBody(required = false) LogoutRequest request,
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) {
		ResolvedRefreshToken refreshToken = refreshTokenCookieService.resolveRefreshToken(
				request == null ? null : request.refreshToken(),
				servletRequest);
		LogoutResponse response = authRegistrationService.logout(refreshToken.token());
		refreshTokenCookieService.clearRefreshTokenCookie(servletResponse);

		return response;
	}

	@GetMapping("/me")
	public CurrentUserResponse me(@AuthenticationPrincipal Jwt jwt) {
		return authRegistrationService.currentUser(jwt.getSubject());
	}

	private static LoginResponse withoutRefreshToken(LoginResponse response) {
		return new LoginResponse(
				response.userId(),
				response.email(),
				response.displayName(),
				response.roles(),
				response.tokenType(),
				response.accessToken(),
				response.accessTokenExpiresAt(),
				null,
				response.refreshTokenExpiresAt());
	}

	private static RefreshResponse withoutRefreshToken(RefreshResponse response) {
		return new RefreshResponse(
				response.tokenType(),
				response.accessToken(),
				response.accessTokenExpiresAt(),
				null,
				response.refreshTokenExpiresAt());
	}
}
