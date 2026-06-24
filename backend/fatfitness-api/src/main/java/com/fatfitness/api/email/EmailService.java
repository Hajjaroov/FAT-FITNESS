package com.fatfitness.api.email;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fatfitness.api.config.EmailProperties;

@Service
public class EmailService {

	private static final Logger log = LoggerFactory.getLogger(EmailService.class);

	private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
	private static final Duration READ_TIMEOUT = Duration.ofSeconds(10);

	private final EmailProperties emailProperties;
	private final RestClient restClient;

	public EmailService(EmailProperties emailProperties) {
		this.emailProperties = emailProperties;
		SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
		requestFactory.setConnectTimeout(CONNECT_TIMEOUT);
		requestFactory.setReadTimeout(READ_TIMEOUT);
		this.restClient = RestClient.builder()
				.baseUrl("https://api.resend.com")
				.requestFactory(requestFactory)
				.build();
	}

	/**
	 * Sends the verification email. Email delivery is best-effort and must never
	 * roll back account creation: a Resend outage or timeout is logged, not thrown.
	 * Users who miss the email can request a new one via resend-verification.
	 */
	public void sendVerificationEmail(String toEmail, String displayName, String rawToken) {
		String link = emailProperties.appBaseUrl() + "/verify-email?token=" + rawToken;
		String apiKey = emailProperties.resendApiKey();
		if (apiKey == null || apiKey.isBlank()) {
			log.info("[EMAIL DEV] Verification link for {}: {}", toEmail, link);
			return;
		}

		String html = buildVerificationHtml(displayName, link);

		try {
			restClient.post()
					.uri("/emails")
					.header("Authorization", "Bearer " + apiKey)
					.contentType(MediaType.APPLICATION_JSON)
					.body(new ResendRequest(emailProperties.from(), toEmail, "Verify your Fat Fitness Community email", html))
					.retrieve()
					.toBodilessEntity();
		} catch (RuntimeException ex) {
			log.error("Failed to send verification email to {}: {}", toEmail, ex.getMessage());
		}
	}

	public void sendPasswordResetEmail(String toEmail, String displayName, String rawToken) {
		String link = emailProperties.appBaseUrl() + "/reset-password?token=" + rawToken;
		String apiKey = emailProperties.resendApiKey();
		if (apiKey == null || apiKey.isBlank()) {
			log.info("[EMAIL DEV] Password reset link for {}: {}", toEmail, link);
			return;
		}

		String html = buildPasswordResetHtml(displayName, link);

		try {
			restClient.post()
					.uri("/emails")
					.header("Authorization", "Bearer " + apiKey)
					.contentType(MediaType.APPLICATION_JSON)
					.body(new ResendRequest(emailProperties.from(), toEmail, "Reset your Fat Fitness Community password", html))
					.retrieve()
					.toBodilessEntity();
		} catch (RuntimeException ex) {
			log.error("Failed to send password reset email to {}: {}", toEmail, ex.getMessage());
		}
	}

	private static String buildVerificationHtml(String displayName, String link) {
		return """
				<!DOCTYPE html>
				<html lang="en">
				<head><meta charset="UTF-8"></head>
				<body style="font-family:sans-serif;background:#fffaf1;margin:0;padding:32px;">
				  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;">
				    <h1 style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 16px;">
				      Verify your email
				    </h1>
				    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
				      Hi %s,<br><br>
				      Click the button below to verify your Fat Fitness Community account.
				      This link expires in 24 hours.
				    </p>
				    <a href="%s"
				       style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 28px;
				              border-radius:100px;text-decoration:none;font-weight:600;font-size:14px;">
				      Verify email
				    </a>
				    <p style="color:#999;font-size:12px;margin:24px 0 0;line-height:1.6;">
				      If you did not create this account, you can ignore this email.<br>
				      Fat Fitness Community — personal journey, beginner-friendly support.
				    </p>
				  </div>
				</body>
				</html>
				""".formatted(displayName, link);
	}

	private static String buildPasswordResetHtml(String displayName, String link) {
		return """
				<!DOCTYPE html>
				<html lang="en">
				<head><meta charset="UTF-8"></head>
				<body style="font-family:sans-serif;background:#fffaf1;margin:0;padding:32px;">
				  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;">
				    <h1 style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 16px;">
				      Reset your password
				    </h1>
				    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
				      Hi %s,<br><br>
				      Click the button below to set a new password for your Fat Fitness Community account.
				      This link expires in 30 minutes.
				    </p>
				    <a href="%s"
				       style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 28px;
				              border-radius:100px;text-decoration:none;font-weight:600;font-size:14px;">
				      Reset password
				    </a>
				    <p style="color:#999;font-size:12px;margin:24px 0 0;line-height:1.6;">
				      If you did not request a password reset, you can ignore this email.<br>
				      Fat Fitness Community — personal journey, beginner-friendly support.
				    </p>
				  </div>
				</body>
				</html>
				""".formatted(displayName, link);
	}

	private record ResendRequest(String from, String to, String subject, String html) {}
}
