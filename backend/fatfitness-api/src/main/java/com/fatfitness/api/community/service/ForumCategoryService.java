package com.fatfitness.api.community.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.community.dto.ForumCategoryResponse;
import com.fatfitness.api.community.entity.ForumCategory;
import com.fatfitness.api.community.repository.ForumCategoryRepository;

@Service
public class ForumCategoryService {

	private final ForumCategoryRepository forumCategoryRepository;

	public ForumCategoryService(ForumCategoryRepository forumCategoryRepository) {
		this.forumCategoryRepository = forumCategoryRepository;
	}

	@Transactional(readOnly = true)
	public List<ForumCategoryResponse> listCategories() {
		return forumCategoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
				.stream()
				.map(ForumCategoryService::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public ForumCategoryResponse getCategory(String slug) {
		return forumCategoryRepository.findBySlugAndActiveTrue(slug)
				.map(ForumCategoryService::toResponse)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum category not found"));
	}

	private static ForumCategoryResponse toResponse(ForumCategory category) {
		return new ForumCategoryResponse(
				category.getId(),
				category.getSlug(),
				category.getName(),
				category.getDescription(),
				category.getDisplayOrder());
	}
}
