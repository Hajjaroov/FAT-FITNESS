package com.fatfitness.api.auth.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import com.fatfitness.api.config.AuthProperties;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class RefreshTokenCookieService {

	private final AuthProperties.RefreshCookie refreshCookie;

	public RefreshTokenCookieService(AuthProperties authProperties) {
		this.refreshCookie = authProperties.refreshCookie();
	}

	public void addRefreshTokenCookie(
			HttpServletResponse servletResponse,
			String refreshToken,
			Instant expiresAt) {
		servletResponse.addHeader(HttpHeaders.SET_COOKIE, baseCookie(refreshToken)
				.maxAge(maxAgeUntil(expiresAt))
				.build()
				.toString());
	}

	public void clearRefreshTokenCookie(HttpServletResponse servletResponse) {
		servletResponse.addHeader(HttpHeaders.SET_COOKIE, baseCookie("")
				.maxAge(Duration.ZERO)
				.build()
				.toString());
	}

	public ResolvedRefreshToken resolveRefreshToken(
			String requestBodyRefreshToken,
			HttpServletRequest servletRequest) {
		String bodyToken = cleanToken(requestBodyRefreshToken);
		if (bodyToken != null) {
			return new ResolvedRefreshToken(bodyToken, false);
		}

		return findRefreshCookie(servletRequest)
				.map(c -> c.getValue())
				.map(RefreshTokenCookieService::cleanToken)
				.map((cookieToken) -> new ResolvedRefreshToken(cookieToken, true))
				.orElseGet(() -> new ResolvedRefreshToken(null, false));
	}

	private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
		return ResponseCookie.from(refreshCookie.name(), value)
				.httpOnly(true)
				.secure(refreshCookie.secure())
				.sameSite(refreshCookie.sameSite())
				.path(refreshCookie.path());
	}

	private Optional<Cookie> findRefreshCookie(HttpServletRequest servletRequest) {
		Cookie[] cookies = servletRequest.getCookies();
		if (cookies == null) {
			return Optional.empty();
		}

		return Arrays.stream(cookies)
				.filter((cookie) -> refreshCookie.name().equals(cookie.getName()))
				.findFirst();
	}

	private static Duration maxAgeUntil(Instant expiresAt) {
		Duration maxAge = Duration.between(Instant.now(), expiresAt);
		return maxAge.isNegative() ? Duration.ZERO : maxAge;
	}

	private static String cleanToken(String token) {
		if (token == null) {
			return null;
		}

		String cleaned = token.trim();
		return cleaned.isEmpty() ? null : cleaned;
	}

	public record ResolvedRefreshToken(
			String token,
			boolean fromCookie
	) {
	}
}
