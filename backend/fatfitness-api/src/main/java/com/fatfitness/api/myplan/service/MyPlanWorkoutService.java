package com.fatfitness.api.myplan.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.myplan.dto.AddWorkoutPlanDayExerciseRequest;
import com.fatfitness.api.myplan.dto.AddWorkoutPlanDayRequest;
import com.fatfitness.api.myplan.dto.ExerciseResponse;
import com.fatfitness.api.myplan.dto.ReorderWorkoutPlanDaysRequest;
import com.fatfitness.api.myplan.dto.UpdateExerciseRequest;
import com.fatfitness.api.myplan.dto.UpdateWorkoutPlanDayExerciseRequest;
import com.fatfitness.api.myplan.dto.UpdateWorkoutPlanDayRequest;
import com.fatfitness.api.myplan.dto.WorkoutPlanDayExerciseResponse;
import com.fatfitness.api.myplan.dto.WorkoutPlanDayResponse;
import com.fatfitness.api.myplan.entity.Exercise;
import com.fatfitness.api.myplan.entity.WorkoutPlanDay;
import com.fatfitness.api.myplan.entity.WorkoutPlanDayExercise;
import com.fatfitness.api.myplan.repository.ExerciseRepository;
import com.fatfitness.api.myplan.repository.WorkoutPlanDayExerciseRepository;
import com.fatfitness.api.myplan.repository.WorkoutPlanDayRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Service
public class MyPlanWorkoutService {

	private static final Set<UserRole> MODERATOR_ROLES = Set.of(UserRole.OWNER, UserRole.ADMIN, UserRole.MODERATOR);

	// Seven weekday blocks plus one weekday-less block (e.g. a warm-up protocol
	// that applies to every session).
	private static final int MAX_PLAN_DAYS = 8;

	private final UserAccountRepository userAccountRepository;
	private final ExerciseRepository exerciseRepository;
	private final WorkoutPlanDayRepository workoutPlanDayRepository;
	private final WorkoutPlanDayExerciseRepository workoutPlanDayExerciseRepository;

	public MyPlanWorkoutService(
			UserAccountRepository userAccountRepository,
			ExerciseRepository exerciseRepository,
			WorkoutPlanDayRepository workoutPlanDayRepository,
			WorkoutPlanDayExerciseRepository workoutPlanDayExerciseRepository) {
		this.userAccountRepository = userAccountRepository;
		this.exerciseRepository = exerciseRepository;
		this.workoutPlanDayRepository = workoutPlanDayRepository;
		this.workoutPlanDayExerciseRepository = workoutPlanDayExerciseRepository;
	}

	// --- Exercises (shared catalog) ---

	public List<ExerciseResponse> getExercises(String userIdSubject) {
		requireActiveUser(userIdSubject);
		return exerciseRepository.findAllByOrderByNameAsc().stream()
				.map(MyPlanWorkoutService::toExerciseResponse)
				.toList();
	}

	@Transactional
	public ExerciseResponse updateExercise(UUID exerciseId, UpdateExerciseRequest request, String userIdSubject) {
		requireModerator(userIdSubject);
		Exercise exercise = exerciseRepository.findById(exerciseId)
				.orElseThrow(() -> notFound("Exercise"));

		exercise.update(
				request.name().trim(),
				cleanOptional(request.nameDe()),
				cleanOptional(request.photoSrc()));
		exercise = exerciseRepository.save(exercise);
		return toExerciseResponse(exercise);
	}

	@Transactional
	public void deleteExercise(UUID exerciseId, String userIdSubject) {
		requireModerator(userIdSubject);
		Exercise exercise = exerciseRepository.findById(exerciseId)
				.orElseThrow(() -> notFound("Exercise"));

		// Hibernate's session isn't aware of the DB-level ON DELETE SET NULL, so any
		// plan item still referencing this exercise must have the association cleared
		// explicitly first, or flushing the delete fails with a transient-reference error.
		List<WorkoutPlanDayExercise> itemsUsingExercise = workoutPlanDayExerciseRepository.findByExerciseId(exerciseId);
		itemsUsingExercise.forEach(item -> item.clearExercise());
		workoutPlanDayExerciseRepository.saveAll(itemsUsingExercise);

		exerciseRepository.delete(exercise);
	}

	// --- Plan days ---

	public List<WorkoutPlanDayResponse> getWorkoutPlan(String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		return toPlanResponse(user.getId());
	}

	@Transactional
	public WorkoutPlanDayResponse addWorkoutPlanDay(AddWorkoutPlanDayRequest request, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);

		if (workoutPlanDayRepository.countByUserId(user.getId()) >= MAX_PLAN_DAYS) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"A weekly plan can have at most " + MAX_PLAN_DAYS + " blocks");
		}

		// Derived from the current max position (not a row count), so a position
		// freed up by a prior delete is never reissued to a second day — same
		// reasoning as addDietMeal.
		int nextPosition = workoutPlanDayRepository.findFirstByUserIdOrderByPositionDesc(user.getId())
				.map(day -> day.getPosition() + 1)
				.orElse(0);
		String title = (request.title() == null || request.title().isBlank())
				? "Day " + (nextPosition + 1)
				: request.title().trim();

		WorkoutPlanDay day = workoutPlanDayRepository
				.save(new WorkoutPlanDay(user, title, request.weekday(), nextPosition));
		return new WorkoutPlanDayResponse(
				day.getId(), day.getTitle(), day.getWeekday(), day.getPosition(), List.of(), day.getUpdatedAt());
	}

	@Transactional
	public WorkoutPlanDayResponse updateWorkoutPlanDay(
			UUID dayId,
			UpdateWorkoutPlanDayRequest request,
			String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		WorkoutPlanDay day = requireOwnedDay(dayId, user.getId());
		day.update(request.title().trim(), request.weekday());
		day = workoutPlanDayRepository.save(day);

		List<WorkoutPlanDayExerciseResponse> items = workoutPlanDayExerciseRepository
				.findByPlanDayIdInOrderByCreatedAtAsc(List.of(day.getId()))
				.stream()
				.map(MyPlanWorkoutService::toItemResponse)
				.toList();
		return new WorkoutPlanDayResponse(
				day.getId(), day.getTitle(), day.getWeekday(), day.getPosition(), items, day.getUpdatedAt());
	}

	@Transactional
	public void deleteWorkoutPlanDay(UUID dayId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		WorkoutPlanDay day = requireOwnedDay(dayId, user.getId());
		workoutPlanDayRepository.delete(day);
	}

	@Transactional
	public List<WorkoutPlanDayResponse> reorderWorkoutPlanDays(
			ReorderWorkoutPlanDaysRequest request,
			String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		List<WorkoutPlanDay> days = workoutPlanDayRepository.findByUserIdOrderByPositionAsc(user.getId());

		Set<UUID> existingIds = days.stream().map(day -> day.getId()).collect(Collectors.toSet());
		List<UUID> orderedDayIds = request.orderedDayIds();
		Set<UUID> requestedIds = new HashSet<>(orderedDayIds);
		if (requestedIds.size() != orderedDayIds.size() || !existingIds.equals(requestedIds)) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"Ordered day list must match your existing plan days exactly");
		}

		Map<UUID, WorkoutPlanDay> daysById = days.stream()
				.collect(Collectors.toMap(day -> day.getId(), day -> day));
		for (int position = 0; position < orderedDayIds.size(); position++) {
			daysById.get(orderedDayIds.get(position)).updatePosition(position);
		}
		workoutPlanDayRepository.saveAll(daysById.values());

		return toPlanResponse(user.getId());
	}

	// --- Plan day exercises ---

	@Transactional
	public WorkoutPlanDayExerciseResponse addWorkoutPlanDayExercise(
			UUID dayId,
			AddWorkoutPlanDayExerciseRequest request,
			String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		WorkoutPlanDay day = requireOwnedDay(dayId, user.getId());

		Exercise exercise;
		if (request.exerciseId() != null) {
			exercise = exerciseRepository.findById(request.exerciseId())
					.orElseThrow(() -> notFound("Exercise"));
		}
		else {
			String normalizedName = request.name().trim();
			// Reuse an existing catalog entry with the same name instead of creating
			// a near-duplicate every time someone types an exercise that's already
			// there without picking it from the suggestion list.
			exercise = exerciseRepository.findFirstByNameIgnoreCase(normalizedName)
					.orElseGet(() -> exerciseRepository.save(new Exercise(
							user,
							normalizedName,
							cleanOptional(request.nameDe()),
							null)));
		}

		WorkoutPlanDayExercise item = workoutPlanDayExerciseRepository.save(new WorkoutPlanDayExercise(
				day,
				exercise,
				request.name().trim(),
				request.sets().trim()));

		return toItemResponse(item);
	}

	@Transactional
	public WorkoutPlanDayExerciseResponse updateWorkoutPlanDayExercise(
			UUID dayId,
			UUID itemId,
			UpdateWorkoutPlanDayExerciseRequest request,
			String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		WorkoutPlanDay day = requireOwnedDay(dayId, user.getId());
		WorkoutPlanDayExercise item = workoutPlanDayExerciseRepository.findByIdAndPlanDayId(itemId, day.getId())
				.orElseThrow(() -> notFound("Plan day exercise"));

		item.update(request.name().trim(), request.sets().trim());
		item = workoutPlanDayExerciseRepository.save(item);

		return toItemResponse(item);
	}

	@Transactional
	public void deleteWorkoutPlanDayExercise(UUID dayId, UUID itemId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		WorkoutPlanDay day = requireOwnedDay(dayId, user.getId());
		WorkoutPlanDayExercise item = workoutPlanDayExerciseRepository.findByIdAndPlanDayId(itemId, day.getId())
				.orElseThrow(() -> notFound("Plan day exercise"));
		workoutPlanDayExerciseRepository.delete(item);
	}

	// --- Helpers ---

	private List<WorkoutPlanDayResponse> toPlanResponse(UUID userId) {
		List<WorkoutPlanDay> days = workoutPlanDayRepository.findByUserIdOrderByPositionAsc(userId);
		List<UUID> dayIds = days.stream().map(day -> day.getId()).toList();

		Map<UUID, List<WorkoutPlanDayExerciseResponse>> itemsByDayId = workoutPlanDayExerciseRepository
				.findByPlanDayIdInOrderByCreatedAtAsc(dayIds)
				.stream()
				.collect(Collectors.groupingBy(
						item -> item.getPlanDay().getId(),
						Collectors.mapping(MyPlanWorkoutService::toItemResponse, Collectors.toList())));

		return days.stream()
				.map(day -> new WorkoutPlanDayResponse(
						day.getId(),
						day.getTitle(),
						day.getWeekday(),
						day.getPosition(),
						itemsByDayId.getOrDefault(day.getId(), List.of()),
						day.getUpdatedAt()))
				.toList();
	}

	private WorkoutPlanDay requireOwnedDay(UUID dayId, UUID userId) {
		return workoutPlanDayRepository.findByIdAndUserId(dayId, userId)
				.orElseThrow(() -> notFound("Plan day"));
	}

	private UserAccount requireActiveUser(String userIdSubject) {
		UserAccount user = userAccountRepository.findById(parseUserIdSubject(userIdSubject))
				.orElseThrow(MyPlanWorkoutService::invalidAccessToken);

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

	private static String cleanOptional(String value) {
		if (value == null) {
			return null;
		}

		String cleaned = value.trim();
		return cleaned.isEmpty() ? null : cleaned;
	}

	private static ExerciseResponse toExerciseResponse(Exercise exercise) {
		return new ExerciseResponse(
				exercise.getId(),
				exercise.getName(),
				exercise.getNameDe(),
				exercise.getPhotoSrc());
	}

	private static WorkoutPlanDayExerciseResponse toItemResponse(WorkoutPlanDayExercise item) {
		return new WorkoutPlanDayExerciseResponse(
				item.getId(),
				item.getExercise() == null ? null : item.getExercise().getId(),
				item.getName(),
				item.getSets());
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
