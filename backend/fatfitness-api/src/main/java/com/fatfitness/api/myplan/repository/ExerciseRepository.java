package com.fatfitness.api.myplan.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.myplan.entity.Exercise;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {

	List<Exercise> findAllByOrderByNameAsc();

	Optional<Exercise> findFirstByNameIgnoreCase(String name);
}
