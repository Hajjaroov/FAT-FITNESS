package com.fatfitness.api.myplan.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.myplan.entity.DietMealItem;

public interface DietMealItemRepository extends JpaRepository<DietMealItem, UUID> {

	List<DietMealItem> findByMealIdOrderByCreatedAtAsc(UUID mealId);

	List<DietMealItem> findByMealIdInOrderByCreatedAtAsc(List<UUID> mealIds);

	Optional<DietMealItem> findByIdAndMealId(UUID id, UUID mealId);

	List<DietMealItem> findByFoodId(UUID foodId);
}
