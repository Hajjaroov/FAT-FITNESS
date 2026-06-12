package com.fatfitness.api.community;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ForumCategoryControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void listCategoriesReturnsSeededForumBoardsInDisplayOrder() throws Exception {
		mockMvc.perform(get("/api/community/categories"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(8)))
				.andExpect(jsonPath("$[0].id", notNullValue()))
				.andExpect(jsonPath("$[0].slug").value("introductions"))
				.andExpect(jsonPath("$[0].name").value("Introductions"))
				.andExpect(jsonPath("$[0].displayOrder").value(10))
				.andExpect(jsonPath("$[7].slug").value("equipment-and-tools"))
				.andExpect(jsonPath("$[7].displayOrder").value(80));
	}

	@Test
	void getCategoryReturnsSingleSeededForumBoard() throws Exception {
		mockMvc.perform(get("/api/community/categories/glp-1-experience"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", notNullValue()))
				.andExpect(jsonPath("$.slug").value("glp-1-experience"))
				.andExpect(jsonPath("$.name").value("GLP-1 Experience"))
				.andExpect(jsonPath("$.description").value("Personal experiences and questions to discuss with qualified professionals."))
				.andExpect(jsonPath("$.displayOrder").value(50));
	}

	@Test
	void getCategoryReturnsNotFoundForUnknownSlug() throws Exception {
		mockMvc.perform(get("/api/community/categories/not-a-board"))
				.andExpect(status().isNotFound());
	}
}
