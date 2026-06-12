package com.fatfitness.api.auth.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;

import com.fatfitness.api.auth.service.PasswordHashingService;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest(properties = {
		"fatfitness.auth.owner-seed.email=OWNER@example.COM",
		"fatfitness.auth.owner-seed.display-name=  Site   Owner  ",
		"fatfitness.auth.owner-seed.country-region-code=de",
		"fatfitness.auth.owner-seed.password=owner-secret-password"
})
class OwnerAccountSeederTests {

	@Autowired
	private OwnerAccountSeeder ownerAccountSeeder;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private PasswordHashingService passwordHashingService;

	@Test
	void createsActiveOwnerAccountFromConfiguredSeed() {
		var owner = userAccountRepository.findByEmail("owner@example.com").orElseThrow();

		assertThat(owner.getEmail()).isEqualTo("owner@example.com");
		assertThat(owner.getDisplayName()).isEqualTo("Site Owner");
		assertThat(owner.getCountryRegionCode()).isEqualTo("DE");
		assertThat(owner.getStatus()).isEqualTo(UserStatus.ACTIVE);
		assertThat(owner.getEmailVerifiedAt()).isNotNull();
		assertThat(owner.getRoles()).containsExactlyInAnyOrder(UserRole.USER, UserRole.OWNER);
		assertThat(passwordHashingService.matches("owner-secret-password", owner.getPasswordHash())).isTrue();
	}

	@Test
	void canRunTwiceWithoutCreatingDuplicateOwner() throws Exception {
		ownerAccountSeeder.run(new DefaultApplicationArguments(new String[0]));

		assertThat(userAccountRepository.count()).isEqualTo(1);
		assertThat(userAccountRepository.findByEmail("owner@example.com")).isPresent();
	}
}
