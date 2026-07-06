package com.fatfitness.api.myplan.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.myplan.dto.AddDietMealItemRequest;
import com.fatfitness.api.myplan.dto.AddDietMealRequest;
import com.fatfitness.api.myplan.dto.AddFoodMacroCheckRequest;
import com.fatfitness.api.myplan.dto.DietMealItemResponse;
import com.fatfitness.api.myplan.dto.DietMealResponse;
import com.fatfitness.api.myplan.dto.FoodMacroCheckResponse;
import com.fatfitness.api.myplan.dto.FoodResponse;
import com.fatfitness.api.myplan.dto.ReorderDietMealsRequest;
import com.fatfitness.api.myplan.dto.ResolveFoodMacroCheckRequest;
import com.fatfitness.api.myplan.dto.UpdateDietMealItemRequest;
import com.fatfitness.api.myplan.dto.UpdateDietMealRequest;
import com.fatfitness.api.myplan.dto.UpdateFoodRequest;
import com.fatfitness.api.myplan.service.MyPlanDietService;

@RestController
@RequestMapping("/api/myplan/diet")
public class MyPlanDietController {

	private final MyPlanDietService myPlanDietService;

	public MyPlanDietController(MyPlanDietService myPlanDietService) {
		this.myPlanDietService = myPlanDietService;
	}

	@GetMapping("/foods")
	public List<FoodResponse> getFoods(@AuthenticationPrincipal Jwt jwt) {
		return myPlanDietService.getFoods(jwt.getSubject());
	}

	@PatchMapping("/foods/{foodId}")
	public FoodResponse updateFood(
			@PathVariable UUID foodId,
			@Validated @RequestBody UpdateFoodRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanDietService.updateFood(foodId, request, jwt.getSubject());
	}

	@DeleteMapping("/foods/{foodId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteFood(@PathVariable UUID foodId, @AuthenticationPrincipal Jwt jwt) {
		myPlanDietService.deleteFood(foodId, jwt.getSubject());
	}

	@GetMapping("/meals")
	public List<DietMealResponse> getDietMeals(@AuthenticationPrincipal Jwt jwt) {
		return myPlanDietService.getDietMeals(jwt.getSubject());
	}

	@PostMapping("/meals")
	@ResponseStatus(HttpStatus.CREATED)
	public DietMealResponse addDietMeal(
			@Validated @RequestBody(required = false) AddDietMealRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanDietService.addDietMeal(request == null ? new AddDietMealRequest(null) : request, jwt.getSubject());
	}

	@PatchMapping("/meals/{mealId}")
	public DietMealResponse updateDietMeal(
			@PathVariable UUID mealId,
			@Validated @RequestBody UpdateDietMealRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanDietService.updateDietMeal(mealId, request, jwt.getSubject());
	}

	@DeleteMapping("/meals/{mealId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteDietMeal(@PathVariable UUID mealId, @AuthenticationPrincipal Jwt jwt) {
		myPlanDietService.deleteDietMeal(mealId, jwt.getSubject());
	}

	@PatchMapping("/meals/reorder")
	public List<DietMealResponse> reorderDietMeals(
			@Validated @RequestBody ReorderDietMealsRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanDietService.reorderDietMeals(request, jwt.getSubject());
	}

	@PostMapping("/meals/{mealId}/items")
	@ResponseStatus(HttpStatus.CREATED)
	public DietMealItemResponse addDietMealItem(
			@PathVariable UUID mealId,
			@Validated @RequestBody AddDietMealItemRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanDietService.addDietMealItem(mealId, request, jwt.getSubject());
	}

	@PatchMapping("/meals/{mealId}/items/{itemId}")
	public DietMealItemResponse updateDietMealItem(
			@PathVariable UUID mealId,
			@PathVariable UUID itemId,
			@Validated @RequestBody UpdateDietMealItemRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanDietService.updateDietMealItem(mealId, itemId, request, jwt.getSubject());
	}

	@DeleteMapping("/meals/{mealId}/items/{itemId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteDietMealItem(
			@PathVariable UUID mealId,
			@PathVariable UUID itemId,
			@AuthenticationPrincipal Jwt jwt) {
		myPlanDietService.deleteDietMealItem(mealId, itemId, jwt.getSubject());
	}

	@PostMapping("/macro-checks")
	@ResponseStatus(HttpStatus.CREATED)
	public FoodMacroCheckResponse submitMacroCheck(
			@Validated @RequestBody AddFoodMacroCheckRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanDietService.submitMacroCheck(request, jwt.getSubject());
	}

	@GetMapping("/macro-checks")
	public List<FoodMacroCheckResponse> getMacroChecks(
			@RequestParam(required = false) String status,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanDietService.getMacroChecks(status, jwt.getSubject());
	}

	@PostMapping("/macro-checks/{checkId}/resolve")
	public FoodMacroCheckResponse resolveMacroCheck(
			@PathVariable UUID checkId,
			@Validated @RequestBody ResolveFoodMacroCheckRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanDietService.resolveMacroCheck(checkId, request, jwt.getSubject());
	}
}
