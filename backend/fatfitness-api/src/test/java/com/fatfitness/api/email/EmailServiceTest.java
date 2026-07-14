package com.fatfitness.api.email;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class EmailServiceTest {

	private static final String MALICIOUS_ANCHOR = "<a href=\"javascript:alert(1)\">click</a>";
	private static final String MALICIOUS_IMG = "<img src=x onerror=\"alert(1)\">";

	@Test
	void verificationHtmlEscapesDisplayName() {
		String html = EmailService.buildVerificationHtml(MALICIOUS_ANCHOR, "https://example.com/verify");

		assertThat(html).doesNotContain(MALICIOUS_ANCHOR);
		assertThat(html).contains("&lt;a href=&quot;javascript:alert(1)&quot;&gt;click&lt;/a&gt;".replace("&quot;", "\""));
	}

	@Test
	void passwordResetHtmlEscapesDisplayName() {
		String html = EmailService.buildPasswordResetHtml(MALICIOUS_IMG, "https://example.com/reset");

		assertThat(html).doesNotContain(MALICIOUS_IMG);
		assertThat(html).contains("&lt;img src=x onerror=\"alert(1)\"&gt;");
	}

	@Test
	void newMessageHtmlEscapesRecipientSenderAndSubject() {
		String html = EmailService.buildNewMessageHtml(
				MALICIOUS_ANCHOR,
				MALICIOUS_IMG,
				MALICIOUS_ANCHOR,
				"https://example.com/messages/123");

		assertThat(html).doesNotContain(MALICIOUS_ANCHOR);
		assertThat(html).doesNotContain(MALICIOUS_IMG);
		assertThat(html).contains("&lt;a href=\"javascript:alert(1)\"&gt;click&lt;/a&gt;");
		assertThat(html).contains("&lt;img src=x onerror=\"alert(1)\"&gt;");
	}

	@Test
	void escapeHtmlEscapesAmpersandLtAndGt() {
		assertThat(EmailService.escapeHtml("Tom & Jerry <script>alert('x')</script>"))
				.isEqualTo("Tom &amp; Jerry &lt;script&gt;alert('x')&lt;/script&gt;");
	}
}
