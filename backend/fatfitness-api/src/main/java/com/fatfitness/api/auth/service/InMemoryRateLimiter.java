package com.fatfitness.api.auth.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.config.AuthProperties;

/**
 * Sliding-window in-memory rate limiter keyed by arbitrary strings (e.g. IP address).
 * No external dependency needed at this scale. A scheduled task evicts stale buckets
 * every 10 minutes so memory does not grow unboundedly under sustained traffic.
 * Disabled via {@code fatfitness.auth.rate-limit.enabled=false} (used in tests).
 */
@Service
public class InMemoryRateLimiter {

	private final boolean enabled;
	private final ConcurrentHashMap<String, Deque<Instant>> buckets = new ConcurrentHashMap<>();

	public InMemoryRateLimiter(AuthProperties authProperties) {
		this.enabled = authProperties.rateLimit().enabled();
	}

	/**
	 * Checks the limit and records the attempt atomically.
	 * Throws 429 if the caller has exceeded {@code maxAttempts} within {@code window}.
	 */
	public void check(String key, int maxAttempts, Duration window) {
		if (!enabled) return;
		Instant now = Instant.now();
		Instant windowStart = now.minus(window);

		Deque<Instant> deque = buckets.computeIfAbsent(key, k -> new ArrayDeque<>());

		synchronized (deque) {
			// Drop timestamps outside the current window
			while (!deque.isEmpty() && deque.peekFirst().isBefore(windowStart)) {
				deque.pollFirst();
			}

			if (deque.size() >= maxAttempts) {
				throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
						"Too many attempts. Please wait before trying again.");
			}

			deque.addLast(now);
		}
	}

	/** Evicts buckets whose newest timestamp is older than 1 hour. Runs every 10 minutes. */
	@Scheduled(fixedDelay = 600_000)
	void evictStaleBuckets() {
		Instant cutoff = Instant.now().minus(Duration.ofHours(1));
		Iterator<Map.Entry<String, Deque<Instant>>> it = buckets.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry<String, Deque<Instant>> entry = it.next();
			Deque<Instant> deque = entry.getValue();
			synchronized (deque) {
				if (deque.isEmpty() || deque.peekLast().isBefore(cutoff)) {
					it.remove();
				}
			}
		}
	}
}
