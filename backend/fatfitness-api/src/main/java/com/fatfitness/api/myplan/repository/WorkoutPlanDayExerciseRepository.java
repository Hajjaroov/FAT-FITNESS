package com.fatfitness.api.myplan.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.myplan.entity.WorkoutPlanDayExercise;

public interface WorkoutPlanDayExerciseRepository extends JpaRepository<WorkoutPlanDayExercise, UUID> {

	List<WorkoutPlanDayExercise> findByPlanDayIdInOrderByCreatedAtAsc(List<UUID> planDayIds);

	Optional<WorkoutPlanDayExercise> findByIdAndPlanDayId(UUID id, UUID planDayId);

	List<WorkoutPlanDayExercise> findByExerciseId(UUID exerciseId);
}
