package com.fatfitness.api.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.auth.model.RefreshSession;

public interface RefreshSessionRepository extends JpaRepository<RefreshSession, UUID> {

	Optional<RefreshSession> findByRefreshTokenHash(String refreshTokenHash);
}
