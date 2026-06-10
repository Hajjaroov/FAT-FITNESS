package com.fatfitness.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.fatfitness.api.auth.service.PasswordHashingService;

class PasswordHashingServiceTests {

	private final PasswordHashingService passwordHashingService =
			new PasswordHashingService(new BCryptPasswordEncoder());

	@Test
	void hashesAndVerifiesPassword() {
		String hash = passwordHashingService.hash("correct horse battery staple");

		assertThat(hash).isNotEqualTo("correct horse battery staple");
		assertThat(passwordHashingService.matches("correct horse battery staple", hash)).isTrue();
		assertThat(passwordHashingService.matches("wrong password", hash)).isFalse();
	}
}
