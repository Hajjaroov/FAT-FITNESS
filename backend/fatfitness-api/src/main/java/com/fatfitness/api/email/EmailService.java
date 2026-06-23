package com.fatfitness.api.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fatfitness.api.config.EmailProperties;

@Service
public class EmailService {

	private static final Logger log = LoggerFactory.getLogger(EmailService.class);

	private final EmailProperties emailProperties;
	private final RestClient restClient;

	public EmailService(EmailProperties emailProperties) {
		this.emailProperties = emailProperties;
		this.restClient = RestClient.builder()
				.baseUrl("https://api.resend.com")
				.build();
	}

	public void sendVerificationEmail(String toEmail, String displayName, String rawToken) {
		String link = emailProperties.appBaseUrl() + "/verify-email?token=" + rawToken;
		String apiKey = emailProperties.resendApiKey();
		if (apiKey == null || apiKey.isBlank()) {
			log.info("[EMAIL DEV] Verification link for {}: {}", toEmail, link);
			return;
		}

		String html = buildVerificationHtml(displayName, link);

		restClient.post()
				.uri("/emails")
				.header("Authorization", "Bearer " + apiKey)
				.contentType(MediaType.APPLICATION_JSON)
				.body(new ResendRequest(emailProperties.from(), toEmail, "Verify your Fat Fitness Community email", html))
				.retrieve()
				.toBodilessEntity();
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

	private record ResendRequest(String from, String to, String subject, String html) {}
}
