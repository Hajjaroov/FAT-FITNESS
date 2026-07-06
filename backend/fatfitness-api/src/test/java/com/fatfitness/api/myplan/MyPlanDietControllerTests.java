package com.fatfitness.api.myplan;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MyPlanDietControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	// --- Auth enforcement ---

	@Test
	void getFoodsRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/myplan/diet/foods"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void getMealsRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/myplan/diet/meals"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void postMealsRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/myplan/diet/meals"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void getMacroChecksRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/myplan/diet/macro-checks"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void postMacroChecksRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/myplan/diet/macro-checks")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "targetFoodId": "00000000-0000-0000-0000-000000000000", "proposedCaloriesPerUnit": 1, "proposedProteinPerUnit": 1, "proposedCarbsPerUnit": 1, "proposedFatPerUnit": 1 }
								"""))
				.andExpect(status().isUnauthorized());
	}

	// --- Foods (shared catalog) ---

	@Test
	void foodsListStartsEmpty() throws Exception {
		String token = registerVerifyAndLogin("foods-empty@example.com");

		mockMvc.perform(get("/api/myplan/diet/foods")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void customFoodItemAutoJoinsSharedCatalogForOtherUsers() throws Exception {
		String tokenA = registerVerifyAndLogin("diet-custom-a@example.com");
		String tokenB = registerVerifyAndLogin("diet-custom-b@example.com");

		String mealId = addMeal(tokenA, null);
		String foodId = addCustomItemAndReturnFoodId(mealId, tokenA, "Diet Test Custom Eggs", "1 egg, 57g", "3", "78", "7", "0.5", "5.4");

		MvcResult result = mockMvc.perform(get("/api/myplan/diet/foods")
						.header("Authorization", "Bearer " + tokenB))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andReturn();

		assertEquals(
				"Diet Test Custom Eggs",
				findFoodFieldById(result.getResponse().getContentAsString(), foodId, "name"));
	}

	@Test
	void customFoodItemWithGermanNameStoresBothNamesOnSharedFood() throws Exception {
		String token = registerVerifyAndLogin("diet-custom-de@example.com");
		String mealId = addMeal(token, null);

		MvcResult result = mockMvc.perform(post("/api/myplan/diet/meals/{mealId}/items", mealId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Diet Test Quark", "nameDe": "Diet Test Quark DE", "unitLabel": "250g", "quantity": 1, "caloriesPerUnit": 130, "proteinPerUnit": 12, "carbsPerUnit": 4, "fatPerUnit": 5 }
								"""))
				.andExpect(status().isCreated())
				.andReturn();
		String foodId = JsonPath.read(result.getResponse().getContentAsString(), "$.foodId");

		MvcResult foodsResult = mockMvc.perform(get("/api/myplan/diet/foods")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andReturn();

		assertEquals(
				"Diet Test Quark DE",
				findFoodFieldById(foodsResult.getResponse().getContentAsString(), foodId, "nameDe"));
	}

	@Test
	void customFoodItemWithoutGermanNameLeavesItNull() throws Exception {
		String token = registerVerifyAndLogin("diet-custom-no-de@example.com");
		String mealId = addMeal(token, null);
		String foodId = addCustomItemAndReturnFoodId(mealId, token, "Diet Test Oat Bran", "50g", "1", "180", "13", "20", "5");

		MvcResult foodsResult = mockMvc.perform(get("/api/myplan/diet/foods")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andReturn();

		assertEquals(
				null,
				findFoodFieldById(foodsResult.getResponse().getContentAsString(), foodId, "nameDe"));
	}

	@Test
	void plainUserCannotEditOrDeleteSharedFood() throws Exception {
		String owner = registerVerifyAndLogin("diet-food-owner@example.com");
		String otherUser = registerVerifyAndLogin("diet-food-other@example.com");

		String mealId = addMeal(owner, null);
		String foodId = addCustomItemAndReturnFoodId(mealId, owner, "Rice", "80g", "1", "290", "6", "64", "0.5");

		mockMvc.perform(patch("/api/myplan/diet/foods/{foodId}", foodId)
						.header("Authorization", "Bearer " + otherUser)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Rice", "unitLabel": "80g", "caloriesPerUnit": 999, "proteinPerUnit": 6, "carbsPerUnit": 64, "fatPerUnit": 0.5 }
								"""))
				.andExpect(status().isForbidden());

		mockMvc.perform(delete("/api/myplan/diet/foods/{foodId}", foodId)
						.header("Authorization", "Bearer " + otherUser))
				.andExpect(status().isForbidden());
	}

	@Test
	void moderatorCanEditSharedFood() throws Exception {
		String contributor = registerVerifyAndLogin("diet-food-contrib@example.com");
		String moderator = registerVerifyAddRoleAndLogin("diet-food-mod@example.com", UserRole.MODERATOR);

		String mealId = addMeal(contributor, null);
		String foodId = addCustomItemAndReturnFoodId(mealId, contributor, "Potato", "150g", "1", "116", "3", "25", "0.2");

		mockMvc.perform(patch("/api/myplan/diet/foods/{foodId}", foodId)
						.header("Authorization", "Bearer " + moderator)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Potato", "unitLabel": "150g", "caloriesPerUnit": 120, "proteinPerUnit": 3, "carbsPerUnit": 26, "fatPerUnit": 0.2 }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.caloriesPerUnit").value(120));
	}

	@Test
	void moderatorCanDeleteSharedFoodWithoutDeletingLoggedItem() throws Exception {
		String contributor = registerVerifyAndLogin("diet-food-del-contrib@example.com");
		String moderator = registerVerifyAddRoleAndLogin("diet-food-del-mod@example.com", UserRole.MODERATOR);

		String mealId = addMeal(contributor, null);
		String foodId = addCustomItemAndReturnFoodId(mealId, contributor, "Broccoli", "160g", "1", "66", "4", "8", "0.7");

		mockMvc.perform(delete("/api/myplan/diet/foods/{foodId}", foodId)
						.header("Authorization", "Bearer " + moderator))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + contributor))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].items[0].name").value("Broccoli"))
				.andExpect(jsonPath("$[0].items[0].caloriesPerUnit").value(66))
				.andExpect(jsonPath("$[0].items[0].foodId").isEmpty());
	}

	// --- Meals ---

	@Test
	void addMealDefaultsToSequentialTitles() throws Exception {
		String token = registerVerifyAndLogin("meal-default-title@example.com");

		mockMvc.perform(post("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title").value("Meal 1"));

		mockMvc.perform(post("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title").value("Meal 2"));
	}

	@Test
	void addMealAcceptsCustomTitle() throws Exception {
		String token = registerVerifyAndLogin("meal-custom-title@example.com");

		mockMvc.perform(post("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "title": "Shake" }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title").value("Shake"));
	}

	@Test
	void renameMealUpdatesTitle() throws Exception {
		String token = registerVerifyAndLogin("meal-rename@example.com");
		String mealId = addMeal(token, null);

		mockMvc.perform(patch("/api/myplan/diet/meals/{mealId}", mealId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "title": "Shake" }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("Shake"));
	}

	@Test
	void deleteMealRemovesIt() throws Exception {
		String token = registerVerifyAndLogin("meal-delete@example.com");
		String mealId = addMeal(token, null);

		mockMvc.perform(delete("/api/myplan/diet/meals/{mealId}", mealId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void mealsAreIsolatedPerUser() throws Exception {
		String tokenA = registerVerifyAndLogin("meal-isolation-a@example.com");
		String tokenB = registerVerifyAndLogin("meal-isolation-b@example.com");
		String mealId = addMeal(tokenA, "Meal 1");

		mockMvc.perform(patch("/api/myplan/diet/meals/{mealId}", mealId)
						.header("Authorization", "Bearer " + tokenB)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "title": "Hijacked" }
								"""))
				.andExpect(status().isNotFound());

		mockMvc.perform(get("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + tokenB))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void addMealAfterDeletingMiddleMealAvoidsPositionCollision() throws Exception {
		String token = registerVerifyAndLogin("meal-position-collision@example.com");
		addMeal(token, "A");
		String middleMealId = addMeal(token, "B");
		addMeal(token, "C");

		mockMvc.perform(delete("/api/myplan/diet/meals/{mealId}", middleMealId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		// Old bug: a count-based position/title would reuse position 2 (still
		// held by "C") and title "Meal 3" here, since only 2 meals remain.
		mockMvc.perform(post("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title").value("Meal 4"));

		mockMvc.perform(get("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(3)))
				.andExpect(jsonPath("$[0].title").value("A"))
				.andExpect(jsonPath("$[1].title").value("C"))
				.andExpect(jsonPath("$[2].title").value("Meal 4"));
	}

	@Test
	void reorderMealsUpdatesPositions() throws Exception {
		String token = registerVerifyAndLogin("meal-reorder@example.com");
		String firstMealId = addMeal(token, "First");
		String secondMealId = addMeal(token, "Second");

		mockMvc.perform(patch("/api/myplan/diet/meals/reorder")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "orderedMealIds": ["%s", "%s"] }
								""".formatted(secondMealId, firstMealId)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].title").value("Second"))
				.andExpect(jsonPath("$[1].title").value("First"));
	}

	@Test
	void reorderMealsRejectsMismatchedIdSet() throws Exception {
		String token = registerVerifyAndLogin("meal-reorder-mismatch@example.com");
		addMeal(token, "First");

		mockMvc.perform(patch("/api/myplan/diet/meals/reorder")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "orderedMealIds": ["00000000-0000-0000-0000-000000000000"] }
								"""))
				.andExpect(status().isBadRequest());
	}

	// --- Meal items ---

	@Test
	void addCustomMealItemComputesFromRequestValues() throws Exception {
		String token = registerVerifyAndLogin("item-custom@example.com");
		String mealId = addMeal(token, null);

		mockMvc.perform(post("/api/myplan/diet/meals/{mealId}/items", mealId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Whey", "unitLabel": "30g", "quantity": 1, "caloriesPerUnit": 120, "proteinPerUnit": 22.8, "carbsPerUnit": 1.5, "fatPerUnit": 2 }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.name").value("Whey"))
				.andExpect(jsonPath("$.foodId").isNotEmpty());
	}

	@Test
	void pickingSuggestionSnapshotsEditedMacrosOntoItemOnly() throws Exception {
		String userA = registerVerifyAndLogin("snapshot-a@example.com");
		String userB = registerVerifyAndLogin("snapshot-b@example.com");

		String mealAId = addMeal(userA, null);
		String foodId = addCustomItemAndReturnFoodId(mealAId, userA, "Eggs", "1 egg, 57g", "1", "78", "7", "0.5", "5.4");

		// User B picks the suggestion but edits the macros for their own item only.
		String mealBId = addMeal(userB, null);
		mockMvc.perform(post("/api/myplan/diet/meals/{mealId}/items", mealBId)
						.header("Authorization", "Bearer " + userB)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "foodId": "%s", "name": "Eggs", "unitLabel": "1 egg, 57g", "quantity": 2, "caloriesPerUnit": 80, "proteinPerUnit": 7.2, "carbsPerUnit": 0.5, "fatPerUnit": 5.5 }
								""".formatted(foodId)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.caloriesPerUnit").value(80));

		// The shared food itself is unaffected by user B's personal override.
		MvcResult foodsResult = mockMvc.perform(get("/api/myplan/diet/foods")
						.header("Authorization", "Bearer " + userA))
				.andExpect(status().isOk())
				.andReturn();
		assertEquals(
				78.0,
				numberFieldById(foodsResult.getResponse().getContentAsString(), foodId, "caloriesPerUnit"),
				0.001);

		// User A's original item is also unaffected by user B's edit.
		mockMvc.perform(get("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + userA))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].items[0].caloriesPerUnit").value(78));
	}

	@Test
	void updateMealItemChangesQuantityAndMacros() throws Exception {
		String token = registerVerifyAndLogin("item-update@example.com");
		String mealId = addMeal(token, null);
		String itemId = addCustomItemAndReturnItemId(mealId, token, "Rice", "80g", "1", "290", "6", "64", "0.5");

		mockMvc.perform(patch("/api/myplan/diet/meals/{mealId}/items/{itemId}", mealId, itemId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Rice", "unitLabel": "80g", "quantity": 2, "caloriesPerUnit": 290, "proteinPerUnit": 6, "carbsPerUnit": 64, "fatPerUnit": 0.5 }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.quantity").value(2));
	}

	@Test
	void deleteMealItemRemovesIt() throws Exception {
		String token = registerVerifyAndLogin("item-delete@example.com");
		String mealId = addMeal(token, null);
		String itemId = addCustomItemAndReturnItemId(mealId, token, "Tomato", "83g", "1", "16.6", "0.7", "3.2", "0.2");

		mockMvc.perform(delete("/api/myplan/diet/meals/{mealId}/items/{itemId}", mealId, itemId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].items", hasSize(0)));
	}

	@Test
	void addingSameNamedFoodTwiceReusesExistingCatalogEntry() throws Exception {
		String token = registerVerifyAndLogin("food-dedup@example.com");
		String mealId = addMeal(token, null);

		String firstFoodId = addCustomItemAndReturnFoodId(mealId, token, "Chicken Breast", "100g", "1", "165", "31", "0", "3.6");
		// Different case, different macros typed this time - still the same name+unit.
		String secondFoodId = addCustomItemAndReturnFoodId(mealId, token, "chicken breast", "100g", "2", "170", "32", "0", "4");

		assertEquals(firstFoodId, secondFoodId);

		mockMvc.perform(get("/api/myplan/diet/foods")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].caloriesPerUnit").value(165));

		// The second item still keeps its own typed-in macros as a personal override.
		mockMvc.perform(get("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].items[1].caloriesPerUnit").value(170));
	}

	@Test
	void addItemRejectsOversizedName() throws Exception {
		String token = registerVerifyAndLogin("item-oversized-name@example.com");
		String mealId = addMeal(token, null);
		String tooLongName = "A".repeat(121);

		mockMvc.perform(post("/api/myplan/diet/meals/{mealId}/items", mealId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "%s", "quantity": 1, "caloriesPerUnit": 100, "proteinPerUnit": 1, "carbsPerUnit": 1, "fatPerUnit": 1 }
								""".formatted(tooLongName)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addItemRejectsOutOfRangeCalories() throws Exception {
		String token = registerVerifyAndLogin("item-oversized-calories@example.com");
		String mealId = addMeal(token, null);

		mockMvc.perform(post("/api/myplan/diet/meals/{mealId}/items", mealId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Test Food", "quantity": 1, "caloriesPerUnit": 100000, "proteinPerUnit": 1, "carbsPerUnit": 1, "fatPerUnit": 1 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addItemRejectsMissingQuantity() throws Exception {
		String token = registerVerifyAndLogin("item-missing-qty@example.com");
		String mealId = addMeal(token, null);

		mockMvc.perform(post("/api/myplan/diet/meals/{mealId}/items", mealId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Whey", "caloriesPerUnit": 120, "proteinPerUnit": 22.8, "carbsPerUnit": 1.5, "fatPerUnit": 2 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addItemToAnotherUsersMealReturnsNotFound() throws Exception {
		String owner = registerVerifyAndLogin("item-hijack-owner@example.com");
		String attacker = registerVerifyAndLogin("item-hijack-attacker@example.com");
		String mealId = addMeal(owner, null);

		mockMvc.perform(post("/api/myplan/diet/meals/{mealId}/items", mealId)
						.header("Authorization", "Bearer " + attacker)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Whey", "unitLabel": "30g", "quantity": 1, "caloriesPerUnit": 120, "proteinPerUnit": 22.8, "carbsPerUnit": 1.5, "fatPerUnit": 2 }
								"""))
				.andExpect(status().isNotFound());
	}

	// --- Macro checks ---

	@Test
	void submitMacroCheckRejectsUnknownFood() throws Exception {
		String token = registerVerifyAndLogin("check-unknown-food@example.com");

		mockMvc.perform(post("/api/myplan/diet/macro-checks")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "targetFoodId": "00000000-0000-0000-0000-000000000000", "proposedCaloriesPerUnit": 1, "proposedProteinPerUnit": 1, "proposedCarbsPerUnit": 1, "proposedFatPerUnit": 1 }
								"""))
				.andExpect(status().isNotFound());
	}

	@Test
	void submitDuplicateMacroCheckReturnsConflict() throws Exception {
		String contributor = registerVerifyAndLogin("check-dup-contrib@example.com");
		String reporter = registerVerifyAndLogin("check-dup-reporter@example.com");
		String mealId = addMeal(contributor, null);
		String foodId = addCustomItemAndReturnFoodId(mealId, contributor, "Chicken breast", "333g", "1", "403", "77.5", "0", "5");

		String checkBody = """
				{ "targetFoodId": "%s", "proposedCaloriesPerUnit": 400, "proposedProteinPerUnit": 31, "proposedCarbsPerUnit": 0, "proposedFatPerUnit": 5, "comment": "protein looks off" }
				""".formatted(foodId);

		mockMvc.perform(post("/api/myplan/diet/macro-checks")
						.header("Authorization", "Bearer " + reporter)
						.contentType(MediaType.APPLICATION_JSON)
						.content(checkBody))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/api/myplan/diet/macro-checks")
						.header("Authorization", "Bearer " + reporter)
						.contentType(MediaType.APPLICATION_JSON)
						.content(checkBody))
				.andExpect(status().isConflict());
	}

	@Test
	void userCanReflagFoodAfterPriorFlagIsResolved() throws Exception {
		String contributor = registerVerifyAndLogin("check-reflag-contrib@example.com");
		String reporter = registerVerifyAndLogin("check-reflag-reporter@example.com");
		String moderator = registerVerifyAddRoleAndLogin("check-reflag-mod@example.com", UserRole.MODERATOR);

		String mealId = addMeal(contributor, null);
		String foodId = addCustomItemAndReturnFoodId(mealId, contributor, "Yogurt", "150g", "1", "90", "5", "8", "2");

		String checkBody = """
				{ "targetFoodId": "%s", "proposedCaloriesPerUnit": 95, "proposedProteinPerUnit": 5, "proposedCarbsPerUnit": 8, "proposedFatPerUnit": 2 }
				""".formatted(foodId);

		MvcResult firstCheck = mockMvc.perform(post("/api/myplan/diet/macro-checks")
						.header("Authorization", "Bearer " + reporter)
						.contentType(MediaType.APPLICATION_JSON)
						.content(checkBody))
				.andExpect(status().isCreated())
				.andReturn();
		String firstCheckId = JsonPath.read(firstCheck.getResponse().getContentAsString(), "$.id");

		mockMvc.perform(post("/api/myplan/diet/macro-checks/{id}/resolve", firstCheckId)
						.header("Authorization", "Bearer " + moderator)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "action": "DISMISS" }
								"""))
				.andExpect(status().isOk());

		// The reporter's prior flag is resolved, so they can flag this food again.
		mockMvc.perform(post("/api/myplan/diet/macro-checks")
						.header("Authorization", "Bearer " + reporter)
						.contentType(MediaType.APPLICATION_JSON)
						.content(checkBody))
				.andExpect(status().isCreated());
	}

	@Test
	void plainUserCannotListOrResolveMacroChecks() throws Exception {
		String token = registerVerifyAndLogin("check-forbidden@example.com");

		mockMvc.perform(get("/api/myplan/diet/macro-checks")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isForbidden());

		mockMvc.perform(post("/api/myplan/diet/macro-checks/{id}/resolve", "00000000-0000-0000-0000-000000000000")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "action": "DISMISS" }
								"""))
				.andExpect(status().isForbidden());
	}

	@Test
	void moderatorCanApplyMacroCheckAndUpdatesFood() throws Exception {
		String contributor = registerVerifyAndLogin("check-apply-contrib@example.com");
		String reporter = registerVerifyAndLogin("check-apply-reporter@example.com");
		String moderator = registerVerifyAddRoleAndLogin("check-apply-mod@example.com", UserRole.MODERATOR);

		String mealId = addMeal(contributor, null);
		String foodId = addCustomItemAndReturnFoodId(mealId, contributor, "Chicken breast", "333g", "1", "403", "10", "0", "5");

		MvcResult checkResult = mockMvc.perform(post("/api/myplan/diet/macro-checks")
						.header("Authorization", "Bearer " + reporter)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "targetFoodId": "%s", "proposedCaloriesPerUnit": 403, "proposedProteinPerUnit": 77.5, "proposedCarbsPerUnit": 0, "proposedFatPerUnit": 5, "comment": "protein should be 77.5 not 10" }
								""".formatted(foodId)))
				.andExpect(status().isCreated())
				.andReturn();
		String checkId = JsonPath.read(checkResult.getResponse().getContentAsString(), "$.id");

		mockMvc.perform(get("/api/myplan/diet/macro-checks")
						.header("Authorization", "Bearer " + moderator))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].targetFood.proteinPerUnit").value(10));

		mockMvc.perform(post("/api/myplan/diet/macro-checks/{id}/resolve", checkId)
						.header("Authorization", "Bearer " + moderator)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "action": "APPLY", "finalCaloriesPerUnit": 403, "finalProteinPerUnit": 77.5, "finalCarbsPerUnit": 0, "finalFatPerUnit": 5, "resolutionNote": "verified" }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("RESOLVED"));

		MvcResult foodsResult = mockMvc.perform(get("/api/myplan/diet/foods")
						.header("Authorization", "Bearer " + contributor))
				.andExpect(status().isOk())
				.andReturn();
		assertEquals(
				77.5,
				numberFieldById(foodsResult.getResponse().getContentAsString(), foodId, "proteinPerUnit"),
				0.001);
	}

	@Test
	void moderatorCanDismissMacroCheckWithoutChangingFood() throws Exception {
		String contributor = registerVerifyAndLogin("check-dismiss-contrib@example.com");
		String reporter = registerVerifyAndLogin("check-dismiss-reporter@example.com");
		String moderator = registerVerifyAddRoleAndLogin("check-dismiss-mod@example.com", UserRole.MODERATOR);

		String mealId = addMeal(contributor, null);
		String foodId = addCustomItemAndReturnFoodId(mealId, contributor, "Rice", "80g", "1", "290", "6", "64", "0.5");

		MvcResult checkResult = mockMvc.perform(post("/api/myplan/diet/macro-checks")
						.header("Authorization", "Bearer " + reporter)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "targetFoodId": "%s", "proposedCaloriesPerUnit": 300, "proposedProteinPerUnit": 6, "proposedCarbsPerUnit": 64, "proposedFatPerUnit": 0.5 }
								""".formatted(foodId)))
				.andExpect(status().isCreated())
				.andReturn();
		String checkId = JsonPath.read(checkResult.getResponse().getContentAsString(), "$.id");

		mockMvc.perform(post("/api/myplan/diet/macro-checks/{id}/resolve", checkId)
						.header("Authorization", "Bearer " + moderator)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "action": "DISMISS", "resolutionNote": "values look correct" }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("DISMISSED"));

		MvcResult foodsResult = mockMvc.perform(get("/api/myplan/diet/foods")
						.header("Authorization", "Bearer " + contributor))
				.andExpect(status().isOk())
				.andReturn();
		assertEquals(
				290.0,
				numberFieldById(foodsResult.getResponse().getContentAsString(), foodId, "caloriesPerUnit"),
				0.001);
	}

	@Test
	void resolvingAlreadyResolvedCheckReturnsConflict() throws Exception {
		String contributor = registerVerifyAndLogin("check-reresolve-contrib@example.com");
		String moderator = registerVerifyAddRoleAndLogin("check-reresolve-mod@example.com", UserRole.MODERATOR);

		String mealId = addMeal(contributor, null);
		String foodId = addCustomItemAndReturnFoodId(mealId, contributor, "Potato", "150g", "1", "116", "3", "25", "0.2");

		MvcResult checkResult = mockMvc.perform(post("/api/myplan/diet/macro-checks")
						.header("Authorization", "Bearer " + contributor)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "targetFoodId": "%s", "proposedCaloriesPerUnit": 116, "proposedProteinPerUnit": 3, "proposedCarbsPerUnit": 25, "proposedFatPerUnit": 0.2 }
								""".formatted(foodId)))
				.andExpect(status().isCreated())
				.andReturn();
		String checkId = JsonPath.read(checkResult.getResponse().getContentAsString(), "$.id");

		mockMvc.perform(post("/api/myplan/diet/macro-checks/{id}/resolve", checkId)
						.header("Authorization", "Bearer " + moderator)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "action": "DISMISS" }
								"""))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/myplan/diet/macro-checks/{id}/resolve", checkId)
						.header("Authorization", "Bearer " + moderator)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "action": "DISMISS" }
								"""))
				.andExpect(status().isConflict());
	}

	// --- Helpers ---

	private String addMeal(String token, String title) throws Exception {
		String body = title == null ? "{}" : """
				{ "title": "%s" }
				""".formatted(title);

		MvcResult result = mockMvc.perform(post("/api/myplan/diet/meals")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(body))
				.andExpect(status().isCreated())
				.andReturn();

		return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
	}

	/**
	 * The foods list is sorted alphabetically by name, so a freshly added food's
	 * position depends on its name rather than insertion order — look it up by
	 * ID instead of assuming a fixed list index.
	 */
	private static Object findFoodFieldById(String foodsListResponseBody, String foodId, String field) {
		List<Object> matches = JsonPath.read(
				foodsListResponseBody, "$[?(@.id=='" + foodId + "')]." + field);
		return matches.get(0);
	}

	private static double numberFieldById(String foodsListResponseBody, String foodId, String field) {
		return ((Number) findFoodFieldById(foodsListResponseBody, foodId, field)).doubleValue();
	}

	private String addCustomItemAndReturnFoodId(
			String mealId,
			String token,
			String name,
			String unitLabel,
			String quantity,
			String calories,
			String protein,
			String carbs,
			String fat) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/myplan/diet/meals/{mealId}/items", mealId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "%s", "unitLabel": "%s", "quantity": %s, "caloriesPerUnit": %s, "proteinPerUnit": %s, "carbsPerUnit": %s, "fatPerUnit": %s }
								""".formatted(name, unitLabel, quantity, calories, protein, carbs, fat)))
				.andExpect(status().isCreated())
				.andReturn();

		return JsonPath.read(result.getResponse().getContentAsString(), "$.foodId");
	}

	private String addCustomItemAndReturnItemId(
			String mealId,
			String token,
			String name,
			String unitLabel,
			String quantity,
			String calories,
			String protein,
			String carbs,
			String fat) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/myplan/diet/meals/{mealId}/items", mealId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "%s", "unitLabel": "%s", "quantity": %s, "caloriesPerUnit": %s, "proteinPerUnit": %s, "carbsPerUnit": %s, "fatPerUnit": %s }
								""".formatted(name, unitLabel, quantity, calories, protein, carbs, fat)))
				.andExpect(status().isCreated())
				.andReturn();

		return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
	}

	private String registerVerifyAndLogin(String email) throws Exception {
		registerAndVerify(email);
		return loginActiveMember(email);
	}

	private String registerVerifyAddRoleAndLogin(String email, UserRole role) throws Exception {
		registerAndVerify(email);
		UserAccount user = userAccountRepository.findByEmail(email).orElseThrow();
		user.addRole(role);
		userAccountRepository.saveAndFlush(user);

		return loginActiveMember(email);
	}

	private void registerAndVerify(String email) throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "Test User",
								  "email": "%s",
								  "countryRegionCode": "DE",
								  "password": "very-secret-password",
								  "confirmPassword": "very-secret-password",
								  "acceptedCommunityRules": true,
								  "acceptedPrivacyPolicy": true
								}
								""".formatted(email)))
				.andExpect(status().isCreated());

		UserAccount user = userAccountRepository.findByEmail(email.toLowerCase()).orElseThrow();
		var created = emailVerificationTokenService.createFor(user);

		mockMvc.perform(post("/api/auth/verify-email")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "token": "%s" }
								""".formatted(created.rawToken())))
				.andExpect(status().isOk());
	}

	private String loginActiveMember(String email) throws Exception {
		MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "%s",
								  "password": "very-secret-password",
								  "clientType": "MOBILE",
								  "deviceLabel": "Test client"
								}
								""".formatted(email)))
				.andExpect(status().isOk())
				.andReturn();

		return JsonPath.read(loginResult.getResponse().getContentAsString(), "$.accessToken");
	}
}
