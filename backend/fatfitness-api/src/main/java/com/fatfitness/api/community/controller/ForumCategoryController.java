package com.fatfitness.api.community.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.community.dto.ForumCategoryResponse;
import com.fatfitness.api.community.service.ForumCategoryService;

@RestController
@RequestMapping("/api/community/categories")
public class ForumCategoryController {

	private final ForumCategoryService forumCategoryService;

	public ForumCategoryController(ForumCategoryService forumCategoryService) {
		this.forumCategoryService = forumCategoryService;
	}

	@GetMapping
	public List<ForumCategoryResponse> listCategories() {
		return forumCategoryService.listCategories();
	}

	@GetMapping("/{slug}")
	public ForumCategoryResponse getCategory(@PathVariable String slug) {
		return forumCategoryService.getCategory(slug);
	}
}
