package com.fatfitness.api.myplan.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.myplan.entity.WorkoutPlanDay;

public interface WorkoutPlanDayRepository extends JpaRepository<WorkoutPlanDay, UUID> {

	List<WorkoutPlanDay> findByUserIdOrderByPositionAsc(UUID userId);

	Optional<WorkoutPlanDay> findByIdAndUserId(UUID id, UUID userId);

	Optional<WorkoutPlanDay> findFirstByUserIdOrderByPositionDesc(UUID userId);

	long countByUserId(UUID userId);
}
