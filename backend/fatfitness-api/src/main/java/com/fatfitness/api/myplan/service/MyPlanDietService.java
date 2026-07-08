package com.fatfitness.api.myplan.service;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
import com.fatfitness.api.myplan.entity.DietMeal;
import com.fatfitness.api.myplan.entity.DietMealItem;
import com.fatfitness.api.myplan.entity.Food;
import com.fatfitness.api.myplan.entity.FoodMacroCheck;
import com.fatfitness.api.myplan.entity.FoodMacroCheckStatus;
import com.fatfitness.api.myplan.repository.DietMealItemRepository;
import com.fatfitness.api.myplan.repository.DietMealRepository;
import com.fatfitness.api.myplan.repository.FoodMacroCheckRepository;
import com.fatfitness.api.myplan.repository.FoodRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;
import com.fatfitness.api.user.service.UserPublicDisplayNameService;

@Service
public class MyPlanDietService {

	private static final Set<UserRole> MODERATOR_ROLES = Set.of(UserRole.OWNER, UserRole.ADMIN, UserRole.MODERATOR);

	private final UserAccountRepository userAccountRepository;
	private final FoodRepository foodRepository;
	private final DietMealRepository dietMealRepository;
	private final DietMealItemRepository dietMealItemRepository;
	private final FoodMacroCheckRepository foodMacroCheckRepository;
	private final UserPublicDisplayNameService userPublicDisplayNameService;

	public MyPlanDietService(
			UserAccountRepository userAccountRepository,
			FoodRepository foodRepository,
			DietMealRepository dietMealRepository,
			DietMealItemRepository dietMealItemRepository,
			FoodMacroCheckRepository foodMacroCheckRepository,
			UserPublicDisplayNameService userPublicDisplayNameService) {
		this.userAccountRepository = userAccountRepository;
		this.foodRepository = foodRepository;
		this.dietMealRepository = dietMealRepository;
		this.dietMealItemRepository = dietMealItemRepository;
		this.foodMacroCheckRepository = foodMacroCheckRepository;
		this.userPublicDisplayNameService = userPublicDisplayNameService;
	}

	// --- Foods ---

	public List<FoodResponse> getFoods(String userIdSubject) {
		requireActiveUser(userIdSubject);
		return foodRepository.findAllByOrderByNameAsc().stream().map(MyPlanDietService::toFoodResponse).toList();
	}

	@Transactional
	public FoodResponse updateFood(UUID foodId, UpdateFoodRequest request, String userIdSubject) {
		requireModerator(userIdSubject);
		Food food = foodRepository.findById(foodId)
				.orElseThrow(() -> notFound("Food"));

		food.update(
				request.name().trim(),
				request.nameDe() == null || request.nameDe().isBlank() ? null : request.nameDe().trim(),
				request.unitLabel().trim(),
				request.caloriesPerUnit(),
				request.proteinPerUnit(),
				request.carbsPerUnit(),
				request.fatPerUnit());
		food = foodRepository.save(food);
		return toFoodResponse(food);
	}

	@Transactional
	public void deleteFood(UUID foodId, String userIdSubject) {
		requireModerator(userIdSubject);
		Food food = foodRepository.findById(foodId)
				.orElseThrow(() -> notFound("Food"));

		// Hibernate's session isn't aware of the DB-level ON DELETE SET NULL, so any
		// meal item still referencing this food must have the association cleared
		// explicitly first, or flushing the delete fails with a transient-reference error.
		List<DietMealItem> itemsUsingFood = dietMealItemRepository.findByFoodId(foodId);
		itemsUsingFood.forEach(item -> item.clearFood());
		dietMealItemRepository.saveAll(itemsUsingFood);

		foodRepository.delete(food);
	}

	// --- Meals ---

	public List<DietMealResponse> getDietMeals(String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		List<DietMeal> meals = dietMealRepository.findByUserIdOrderByPositionAsc(user.getId());
		List<UUID> mealIds = meals.stream().map(meal -> meal.getId()).toList();

		Map<UUID, List<DietMealItemResponse>> itemsByMealId = dietMealItemRepository
				.findByMealIdInOrderByCreatedAtAsc(mealIds)
				.stream()
				.collect(Collectors.groupingBy(
						item -> item.getMeal().getId(),
						Collectors.mapping(MyPlanDietService::toItemResponse, Collectors.toList())));

		return meals.stream()
				.map(meal -> new DietMealResponse(
						meal.getId(),
						meal.getTitle(),
						meal.getPosition(),
						itemsByMealId.getOrDefault(meal.getId(), List.of()),
						meal.getUpdatedAt()))
				.toList();
	}

	@Transactional
	public DietMealResponse addDietMeal(AddDietMealRequest request, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		// Derived from the current max position (not a row count), so a position
		// freed up by a prior delete is never reissued to a second meal - that
		// would make findByUserIdOrderByPositionAsc's order undefined between ties.
		int nextPosition = dietMealRepository.findFirstByUserIdOrderByPositionDesc(user.getId())
				.map(meal -> meal.getPosition() + 1)
				.orElse(0);
		String title = (request.title() == null || request.title().isBlank())
				? "Meal " + (nextPosition + 1)
				: request.title().trim();

		DietMeal meal = dietMealRepository.save(new DietMeal(user, title, nextPosition));
		return toMealResponse(meal);
	}

	@Transactional
	public DietMealResponse updateDietMeal(UUID mealId, UpdateDietMealRequest request, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		DietMeal meal = requireOwnedMeal(mealId, user.getId());
		meal.rename(request.title().trim());
		meal = dietMealRepository.save(meal);
		return toMealResponse(meal);
	}

	@Transactional
	public void deleteDietMeal(UUID mealId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		DietMeal meal = requireOwnedMeal(mealId, user.getId());
		dietMealRepository.delete(meal);
	}

	@Transactional
	public List<DietMealResponse> reorderDietMeals(ReorderDietMealsRequest request, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		List<DietMeal> meals = dietMealRepository.findByUserIdOrderByPositionAsc(user.getId());

		Set<UUID> existingIds = meals.stream().map(meal -> meal.getId()).collect(Collectors.toSet());
		List<UUID> orderedMealIds = request.orderedMealIds();
		Set<UUID> requestedIds = new HashSet<>(orderedMealIds);
		if (requestedIds.size() != orderedMealIds.size() || !existingIds.equals(requestedIds)) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"Ordered meal list must match your existing meals exactly");
		}

		Map<UUID, DietMeal> mealsById = meals.stream().collect(Collectors.toMap(meal -> meal.getId(), meal -> meal));
		for (int position = 0; position < orderedMealIds.size(); position++) {
			mealsById.get(orderedMealIds.get(position)).updatePosition(position);
		}
		dietMealRepository.saveAll(mealsById.values());

		return getDietMeals(userIdSubject);
	}

	// --- Meal items ---

	@Transactional
	public DietMealItemResponse addDietMealItem(UUID mealId, AddDietMealItemRequest request, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		DietMeal meal = requireOwnedMeal(mealId, user.getId());

		Food food;
		String itemUnitLabel;
		if (request.foodId() != null) {
			food = foodRepository.findById(request.foodId())
					.orElseThrow(() -> notFound("Food"));
			itemUnitLabel = request.unitLabel() == null ? null : request.unitLabel().trim();
		}
		else {
			String normalizedName = request.name().trim();
			String newFoodUnitLabel = (request.unitLabel() == null || request.unitLabel().isBlank())
					? "unit"
					: request.unitLabel().trim();
			// Reuse an existing catalog entry for the same name+unit instead of
			// creating a near-duplicate every time someone types a food that's
			// already there without picking it from the suggestion list.
			food = foodRepository.findFirstByNameIgnoreCaseAndUnitLabelIgnoreCase(normalizedName, newFoodUnitLabel)
					.orElseGet(() -> foodRepository.save(new Food(
							user,
							normalizedName,
							request.nameDe() == null || request.nameDe().isBlank() ? null : request.nameDe().trim(),
							newFoodUnitLabel,
							request.caloriesPerUnit(),
							request.proteinPerUnit(),
							request.carbsPerUnit(),
							request.fatPerUnit())));
			// Keep the logged item's unit in sync with the (possibly defaulted)
			// value actually stored on the shared food, so the two never disagree.
			itemUnitLabel = newFoodUnitLabel;
		}

		DietMealItem item = dietMealItemRepository.save(new DietMealItem(
				meal,
				food,
				request.name().trim(),
				itemUnitLabel,
				request.quantity(),
				request.caloriesPerUnit(),
				request.proteinPerUnit(),
				request.carbsPerUnit(),
				request.fatPerUnit()));

		return toItemResponse(item);
	}

	@Transactional
	public DietMealItemResponse updateDietMealItem(
			UUID mealId,
			UUID itemId,
			UpdateDietMealItemRequest request,
			String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		DietMeal meal = requireOwnedMeal(mealId, user.getId());
		DietMealItem item = dietMealItemRepository.findByIdAndMealId(itemId, meal.getId())
				.orElseThrow(() -> notFound("Diet meal item"));

		item.update(
				request.name().trim(),
				request.unitLabel() == null ? null : request.unitLabel().trim(),
				request.quantity(),
				request.caloriesPerUnit(),
				request.proteinPerUnit(),
				request.carbsPerUnit(),
				request.fatPerUnit());
		item = dietMealItemRepository.save(item);

		return toItemResponse(item);
	}

	@Transactional
	public void deleteDietMealItem(UUID mealId, UUID itemId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		DietMeal meal = requireOwnedMeal(mealId, user.getId());
		DietMealItem item = dietMealItemRepository.findByIdAndMealId(itemId, meal.getId())
				.orElseThrow(() -> notFound("Diet meal item"));
		dietMealItemRepository.delete(item);
	}

	// --- Macro checks ---

	@Transactional
	public FoodMacroCheckResponse submitMacroCheck(AddFoodMacroCheckRequest request, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		Food food = foodRepository.findById(request.targetFoodId())
				.orElseThrow(() -> notFound("Food"));

		if (foodMacroCheckRepository.existsByTargetFoodIdAndSubmittedByIdAndStatus(
				food.getId(), user.getId(), FoodMacroCheckStatus.OPEN)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have an open flag on this food");
		}

		FoodMacroCheck check;
		try {
			// saveAndFlush (not save) so a unique-constraint violation surfaces
			// here, synchronously, rather than later at transaction commit where
			// this catch block could no longer intercept it.
			check = foodMacroCheckRepository.saveAndFlush(new FoodMacroCheck(
					food,
					user,
					cleanOptional(request.proposedName()),
					cleanOptional(request.proposedUnitLabel()),
					request.proposedCaloriesPerUnit(),
					request.proposedProteinPerUnit(),
					request.proposedCarbsPerUnit(),
					request.proposedFatPerUnit(),
					cleanOptional(request.comment())));
		}
		catch (DataIntegrityViolationException ex) {
			// Two concurrent submissions both passed the exists-check above; the
			// DB-level unique constraint is the final backstop against that race.
			throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have an open flag on this food");
		}

		return toCheckResponse(check);
	}

	@Transactional(readOnly = true)
	public List<FoodMacroCheckResponse> getMacroChecks(String status, String userIdSubject) {
		requireModerator(userIdSubject);

		List<FoodMacroCheck> checks;
		if (status != null && "ALL".equalsIgnoreCase(status.trim())) {
			checks = foodMacroCheckRepository.findAllByOrderByCreatedAtAsc();
		}
		else {
			checks = foodMacroCheckRepository.findByStatusOrderByCreatedAtAsc(parseCheckStatus(status));
		}

		return checks.stream().map(this::toCheckResponse).toList();
	}

	@Transactional
	public FoodMacroCheckResponse resolveMacroCheck(
			UUID checkId,
			ResolveFoodMacroCheckRequest request,
			String userIdSubject) {
		UserAccount moderator = requireModerator(userIdSubject);
		FoodMacroCheck check = foodMacroCheckRepository.findById(checkId)
				.orElseThrow(() -> notFound("Macro check"));
		requireOpen(check.getStatus());

		String action = request.action().trim().toUpperCase(Locale.ROOT);
		if ("APPLY".equals(action)) {
			applyMacroCheck(check, request);
			check.close(FoodMacroCheckStatus.RESOLVED, moderator, cleanOptional(request.resolutionNote()));
		}
		else if ("DISMISS".equals(action)) {
			check.close(FoodMacroCheckStatus.DISMISSED, moderator, cleanOptional(request.resolutionNote()));
		}
		else {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown action; expected APPLY or DISMISS");
		}

		check = foodMacroCheckRepository.save(check);
		return toCheckResponse(check);
	}

	private void applyMacroCheck(FoodMacroCheck check, ResolveFoodMacroCheckRequest request) {
		if (request.finalCaloriesPerUnit() == null
				|| request.finalProteinPerUnit() == null
				|| request.finalCarbsPerUnit() == null
				|| request.finalFatPerUnit() == null) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"Final macro values are required to apply a macro check");
		}

		Food food = check.getTargetFood();
		String finalName = (request.finalName() == null || request.finalName().isBlank())
				? food.getName()
				: request.finalName().trim();
		String finalNameDe = (request.finalNameDe() == null || request.finalNameDe().isBlank())
				? food.getNameDe()
				: request.finalNameDe().trim();
		String finalUnitLabel = (request.finalUnitLabel() == null || request.finalUnitLabel().isBlank())
				? food.getUnitLabel()
				: request.finalUnitLabel().trim();

		food.update(
				finalName,
				finalNameDe,
				finalUnitLabel,
				request.finalCaloriesPerUnit(),
				request.finalProteinPerUnit(),
				request.finalCarbsPerUnit(),
				request.finalFatPerUnit());
		foodRepository.save(food);
	}

	// --- Helpers ---

	private DietMeal requireOwnedMeal(UUID mealId, UUID userId) {
		return dietMealRepository.findByIdAndUserId(mealId, userId)
				.orElseThrow(() -> notFound("Meal"));
	}

	private UserAccount requireActiveUser(String userIdSubject) {
		UserAccount user = userAccountRepository.findById(parseUserIdSubject(userIdSubject))
				.orElseThrow(MyPlanDietService::invalidAccessToken);

		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}

		return user;
	}

	private UserAccount requireModerator(String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);

		if (user.getRoles().stream().noneMatch(MODERATOR_ROLES::contains)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Moderator access required");
		}

		return user;
	}

	private static void requireOpen(FoodMacroCheckStatus status) {
		if (status != FoodMacroCheckStatus.OPEN) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "This macro check has already been resolved.");
		}
	}

	private static FoodMacroCheckStatus parseCheckStatus(String status) {
		if (status == null || status.isBlank()) {
			return FoodMacroCheckStatus.OPEN;
		}

		try {
			return FoodMacroCheckStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
		}
		catch (RuntimeException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown macro check status");
		}
	}

	private static String cleanOptional(String value) {
		if (value == null) {
			return null;
		}

		String cleaned = value.trim();
		return cleaned.isEmpty() ? null : cleaned;
	}

	private static FoodResponse toFoodResponse(Food food) {
		return new FoodResponse(
				food.getId(),
				food.getName(),
				food.getNameDe(),
				food.getUnitLabel(),
				food.getCaloriesPerUnit(),
				food.getProteinPerUnit(),
				food.getCarbsPerUnit(),
				food.getFatPerUnit());
	}

	private DietMealResponse toMealResponse(DietMeal meal) {
		List<DietMealItemResponse> items = dietMealItemRepository.findByMealIdOrderByCreatedAtAsc(meal.getId())
				.stream()
				.map(MyPlanDietService::toItemResponse)
				.toList();
		return new DietMealResponse(meal.getId(), meal.getTitle(), meal.getPosition(), items, meal.getUpdatedAt());
	}

	private static DietMealItemResponse toItemResponse(DietMealItem item) {
		return new DietMealItemResponse(
				item.getId(),
				item.getFood() == null ? null : item.getFood().getId(),
				item.getName(),
				item.getUnitLabel(),
				item.getQuantity(),
				item.getCaloriesPerUnit(),
				item.getProteinPerUnit(),
				item.getCarbsPerUnit(),
				item.getFatPerUnit());
	}

	private FoodMacroCheckResponse toCheckResponse(FoodMacroCheck check) {
		return new FoodMacroCheckResponse(
				check.getId(),
				toFoodResponse(check.getTargetFood()),
				check.getProposedName(),
				check.getProposedUnitLabel(),
				check.getProposedCaloriesPerUnit(),
				check.getProposedProteinPerUnit(),
				check.getProposedCarbsPerUnit(),
				check.getProposedFatPerUnit(),
				check.getComment(),
				userPublicDisplayNameService.resolve(check.getSubmittedBy()),
				check.getStatus(),
				check.getCreatedAt());
	}

	private static UUID parseUserIdSubject(String subject) {
		try {
			return UUID.fromString(subject);
		}
		catch (RuntimeException ex) {
			throw invalidAccessToken();
		}
	}

	private static ResponseStatusException invalidAccessToken() {
		return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid access token");
	}

	private static ResponseStatusException notFound(String what) {
		return new ResponseStatusException(HttpStatus.NOT_FOUND, what + " not found");
	}
}
