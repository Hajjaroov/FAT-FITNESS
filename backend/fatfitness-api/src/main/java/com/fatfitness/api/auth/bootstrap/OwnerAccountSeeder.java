package com.fatfitness.api.auth.bootstrap;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.service.PasswordHashingService;
import com.fatfitness.api.config.AuthProperties;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Component
public class OwnerAccountSeeder implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(OwnerAccountSeeder.class);

	private final AuthProperties authProperties;
	private final UserAccountRepository userAccountRepository;
	private final PasswordHashingService passwordHashingService;

	public OwnerAccountSeeder(
			AuthProperties authProperties,
			UserAccountRepository userAccountRepository,
			PasswordHashingService passwordHashingService) {
		this.authProperties = authProperties;
		this.userAccountRepository = userAccountRepository;
		this.passwordHashingService = passwordHashingService;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		AuthProperties.OwnerSeed ownerSeed = authProperties.ownerSeed();

		if (ownerSeed == null || !ownerSeed.hasAnyValue()) {
			return;
		}

		requireCompleteSeed(ownerSeed);

		String email = normalizeEmail(ownerSeed.email());
		userAccountRepository.findByEmail(email)
				.ifPresentOrElse(
						existingUser -> ensureExistingOwner(existingUser, email),
						() -> createOwner(ownerSeed, email));
	}

	private void ensureExistingOwner(UserAccount user, String email) {
		if (user.getStatus() == UserStatus.BANNED || user.getStatus() == UserStatus.DELETED) {
			log.warn("Owner seed skipped because configured account {} is {}", email, user.getStatus());
			return;
		}

		if (user.getStatus() == UserStatus.PENDING_EMAIL_VERIFICATION) {
			user.verifyEmail();
		}

		if (!user.getRoles().contains(UserRole.OWNER)) {
			user.addRole(UserRole.OWNER);
		}

		userAccountRepository.save(user);
		log.info("Owner seed ensured OWNER role for {}", email);
	}

	private void createOwner(AuthProperties.OwnerSeed ownerSeed, String email) {
		UserAccount owner = new UserAccount(
				email,
				cleanDisplayName(ownerSeed.displayName()),
				normalizeCountryRegionCode(ownerSeed.countryRegionCode()),
				passwordHashingService.hash(ownerSeed.password()));

		owner.verifyEmail();
		owner.addRole(UserRole.OWNER);
		userAccountRepository.save(owner);

		log.info("Owner seed created local OWNER account for {}", email);
	}

	private static void requireCompleteSeed(AuthProperties.OwnerSeed ownerSeed) {
		if (!ownerSeed.hasAllValues()) {
			throw new IllegalStateException(
					"Owner seed requires FATFITNESS_OWNER_EMAIL, FATFITNESS_OWNER_DISPLAY_NAME, "
							+ "FATFITNESS_OWNER_COUNTRY_REGION_CODE, and FATFITNESS_OWNER_PASSWORD");
		}

		if (ownerSeed.password().length() < 8) {
			throw new IllegalStateException("FATFITNESS_OWNER_PASSWORD must be at least 8 characters");
		}
	}

	private static String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private static String normalizeCountryRegionCode(String countryRegionCode) {
		return countryRegionCode.trim().toUpperCase(Locale.ROOT);
	}

	private static String cleanDisplayName(String displayName) {
		return displayName.trim().replaceAll("\\s+", " ");
	}
}
