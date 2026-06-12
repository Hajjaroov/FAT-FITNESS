package com.fatfitness.api.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.community.entity.ForumCategory;

public interface ForumCategoryRepository extends JpaRepository<ForumCategory, UUID> {

	List<ForumCategory> findByActiveTrueOrderByDisplayOrderAsc();

	Optional<ForumCategory> findBySlugAndActiveTrue(String slug);
}
