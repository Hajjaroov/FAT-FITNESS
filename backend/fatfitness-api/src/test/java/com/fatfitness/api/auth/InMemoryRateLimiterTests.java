package com.fatfitness.api.auth;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.auth.service.InMemoryRateLimiter;
import com.fatfitness.api.config.AuthProperties;

class InMemoryRateLimiterTests {

	private static final Duration WINDOW = Duration.ofMinutes(1);

	private InMemoryRateLimiter limiter(boolean enabled) {
		AuthProperties properties = new AuthProperties(
				null, null, null, null,
				new AuthProperties.RateLimit(enabled));
		return new InMemoryRateLimiter(properties);
	}

	@Test
	void allowsAttemptsUpToTheLimitThenRejects() {
		InMemoryRateLimiter rateLimiter = limiter(true);

		for (int i = 0; i < 3; i++) {
			rateLimiter.check("1.2.3.4", 3, WINDOW);
		}

		assertThatThrownBy(() -> rateLimiter.check("1.2.3.4", 3, WINDOW))
				.isInstanceOf(ResponseStatusException.class)
				.satisfies(ex -> org.assertj.core.api.Assertions.assertThat(
						((ResponseStatusException) ex).getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS));
	}

	@Test
	void keepsSeparateCountersPerKey() {
		InMemoryRateLimiter rateLimiter = limiter(true);

		rateLimiter.check("ip-a", 1, WINDOW);
		// A different key still has its own fresh allowance.
		assertThatCode(() -> rateLimiter.check("ip-b", 1, WINDOW)).doesNotThrowAnyException();
		// The first key is now exhausted.
		assertThatThrownBy(() -> rateLimiter.check("ip-a", 1, WINDOW))
				.isInstanceOf(ResponseStatusException.class);
	}

	@Test
	void neverRejectsWhenDisabled() {
		InMemoryRateLimiter rateLimiter = limiter(false);

		assertThatCode(() -> {
			for (int i = 0; i < 50; i++) {
				rateLimiter.check("any-key", 1, WINDOW);
			}
		}).doesNotThrowAnyException();
	}

	@Test
	void allowsAgainOnceTimestampsFallOutsideTheWindow() throws InterruptedException {
		InMemoryRateLimiter rateLimiter = limiter(true);
		Duration shortWindow = Duration.ofMillis(40);

		rateLimiter.check("sliding", 1, shortWindow);
		assertThatThrownBy(() -> rateLimiter.check("sliding", 1, shortWindow))
				.isInstanceOf(ResponseStatusException.class);

		Thread.sleep(80);

		assertThatCode(() -> rateLimiter.check("sliding", 1, shortWindow)).doesNotThrowAnyException();
	}
}
