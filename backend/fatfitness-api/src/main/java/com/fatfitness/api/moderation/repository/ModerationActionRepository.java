package com.fatfitness.api.moderation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.moderation.entity.ModerationAction;

public interface ModerationActionRepository extends JpaRepository<ModerationAction, UUID> {
}
