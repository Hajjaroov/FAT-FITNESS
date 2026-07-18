package com.fatfitness.api.user.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fatfitness.api.user.entity.UserAvatar;

public interface UserAvatarRepository extends JpaRepository<UserAvatar, UUID> {

	// Version-only lookup so a conditional GET (If-None-Match hit) never reads the blob.
	@Query("select ua.updatedAt from UserAvatar ua where ua.userId = :userId")
	Optional<Instant> findUpdatedAtByUserId(@Param("userId") UUID userId);
}
