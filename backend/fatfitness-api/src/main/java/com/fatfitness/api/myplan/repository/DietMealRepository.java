package com.fatfitness.api.myplan.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.myplan.entity.DietMeal;

public interface DietMealRepository extends JpaRepository<DietMeal, UUID> {

	List<DietMeal> findByUserIdOrderByPositionAsc(UUID userId);

	Optional<DietMeal> findByIdAndUserId(UUID id, UUID userId);

	Optional<DietMeal> findFirstByUserIdOrderByPositionDesc(UUID userId);
}
