package com.fatfitness.api.user;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.service.UserPublicDisplayNameService;

class UserPublicDisplayNameServiceTests {

	private final UserPublicDisplayNameService service = new UserPublicDisplayNameService();

	@Test
	void returnsDisplayNameForNormalUser() {
		UserAccount user = new UserAccount("user@example.com", "Journey Starter", "DE", "hash");

		assertThat(service.resolve(user)).isEqualTo("Journey Starter");
	}

	@Test
	void hidesDeletedUserName() {
		UserAccount user = new UserAccount("user@example.com", "Journey Starter", "DE", "hash");
		user.softDelete();

		assertThat(service.resolve(user)).isEqualTo("Deleted account");
	}

	@Test
	void hidesBannedUserName() {
		UserAccount user = new UserAccount("user@example.com", "Journey Starter", "DE", "hash");
		user.ban();

		assertThat(service.resolve(user)).isEqualTo("Banned account");
	}
}
