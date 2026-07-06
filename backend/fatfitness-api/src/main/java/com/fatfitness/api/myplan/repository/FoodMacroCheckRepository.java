package com.fatfitness.api.myplan.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.myplan.entity.FoodMacroCheck;
import com.fatfitness.api.myplan.entity.FoodMacroCheckStatus;

public interface FoodMacroCheckRepository extends JpaRepository<FoodMacroCheck, UUID> {

	List<FoodMacroCheck> findByStatusOrderByCreatedAtAsc(FoodMacroCheckStatus status);

	List<FoodMacroCheck> findAllByOrderByCreatedAtAsc();

	boolean existsByTargetFoodIdAndSubmittedByIdAndStatus(
			UUID targetFoodId, UUID submittedByUserId, FoodMacroCheckStatus status);
}
