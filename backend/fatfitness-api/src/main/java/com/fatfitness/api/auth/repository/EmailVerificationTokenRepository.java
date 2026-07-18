package com.fatfitness.api.auth.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.fatfitness.api.auth.model.EmailVerificationToken;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {

	Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("delete from EmailVerificationToken t where t.expiresAt < :cutoff")
	int deleteByExpiresAtBefore(Instant cutoff);
}
