package com.fatfitness.api.myplan.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.myplan.entity.UserWeightGoal;

public interface UserWeightGoalRepository extends JpaRepository<UserWeightGoal, UUID> {

	Optional<UserWeightGoal> findByUserId(UUID userId);
}
