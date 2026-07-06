package com.fatfitness.api.myplan.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.myplan.entity.Food;

public interface FoodRepository extends JpaRepository<Food, UUID> {

	List<Food> findAllByOrderByNameAsc();

	Optional<Food> findFirstByNameIgnoreCaseAndUnitLabelIgnoreCase(String name, String unitLabel);
}
