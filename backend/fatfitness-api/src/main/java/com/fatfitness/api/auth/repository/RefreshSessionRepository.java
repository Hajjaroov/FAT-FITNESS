package com.fatfitness.api.auth.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.model.RefreshSession;
import java.time.Instant;

public interface RefreshSessionRepository extends JpaRepository<RefreshSession, UUID> {

	Optional<RefreshSession> findByRefreshTokenHash(String refreshTokenHash);

	List<RefreshSession> findByUserId(UUID userId);

	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Transactional
	@Query("update RefreshSession r set r.revokedAt = :now where r.user.id = :userId and r.revokedAt is null")
	void revokeAllByUserId(UUID userId, Instant now);

	// Purge support: rotation chains (replaced_by_session_id) always point from an
	// older session to a newer one, so referrers expire first — but null the FK on
	// any survivor first anyway, so the delete below can never trip the constraint.
	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("update RefreshSession r set r.replacedBySession = null"
			+ " where r.replacedBySession.id in (select s.id from RefreshSession s where s.expiresAt < :cutoff)")
	int detachReplacementReferencesForExpiredBefore(Instant cutoff);

	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("delete from RefreshSession r where r.expiresAt < :cutoff")
	int deleteByExpiresAtBefore(Instant cutoff);
}
