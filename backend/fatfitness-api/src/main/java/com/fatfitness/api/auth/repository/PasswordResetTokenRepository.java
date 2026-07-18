package com.fatfitness.api.auth.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.fatfitness.api.auth.model.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

	Optional<PasswordResetToken> findByTokenHash(String tokenHash);

	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("delete from PasswordResetToken t where t.expiresAt < :cutoff")
	int deleteByExpiresAtBefore(Instant cutoff);
}
