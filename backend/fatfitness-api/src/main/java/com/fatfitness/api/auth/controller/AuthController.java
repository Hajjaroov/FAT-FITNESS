package com.fatfitness.api.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
import com.fatfitness.api.auth.service.AuthRegistrationService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthRegistrationService authRegistrationService;

	public AuthController(AuthRegistrationService authRegistrationService) {
		this.authRegistrationService = authRegistrationService;
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
			HttpServletRequest servletRequest) {
		return authRegistrationService.login(
				request,
				servletRequest.getHeader("User-Agent"),
				servletRequest.getRemoteAddr());
	}

	@PostMapping("/refresh")
	public RefreshResponse refresh(
			@Valid @RequestBody RefreshRequest request,
			HttpServletRequest servletRequest) {
		return authRegistrationService.refresh(
				request,
				servletRequest.getHeader("User-Agent"),
				servletRequest.getRemoteAddr());
	}
}
