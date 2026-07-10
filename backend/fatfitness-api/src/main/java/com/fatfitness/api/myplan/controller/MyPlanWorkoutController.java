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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.myplan.dto.AddWorkoutPlanDayExerciseRequest;
import com.fatfitness.api.myplan.dto.AddWorkoutPlanDayRequest;
import com.fatfitness.api.myplan.dto.ExerciseResponse;
import com.fatfitness.api.myplan.dto.ReorderWorkoutPlanDaysRequest;
import com.fatfitness.api.myplan.dto.UpdateExerciseRequest;
import com.fatfitness.api.myplan.dto.UpdateWorkoutPlanDayExerciseRequest;
import com.fatfitness.api.myplan.dto.UpdateWorkoutPlanDayRequest;
import com.fatfitness.api.myplan.dto.WorkoutPlanDayExerciseResponse;
import com.fatfitness.api.myplan.dto.WorkoutPlanDayResponse;
import com.fatfitness.api.myplan.service.MyPlanWorkoutService;

@RestController
@RequestMapping("/api/myplan/workout")
public class MyPlanWorkoutController {

	private final MyPlanWorkoutService myPlanWorkoutService;

	public MyPlanWorkoutController(MyPlanWorkoutService myPlanWorkoutService) {
		this.myPlanWorkoutService = myPlanWorkoutService;
	}

	@GetMapping("/exercises")
	public List<ExerciseResponse> getExercises(@AuthenticationPrincipal Jwt jwt) {
		return myPlanWorkoutService.getExercises(jwt.getSubject());
	}

	@PatchMapping("/exercises/{exerciseId}")
	public ExerciseResponse updateExercise(
			@PathVariable UUID exerciseId,
			@Validated @RequestBody UpdateExerciseRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanWorkoutService.updateExercise(exerciseId, request, jwt.getSubject());
	}

	@DeleteMapping("/exercises/{exerciseId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteExercise(@PathVariable UUID exerciseId, @AuthenticationPrincipal Jwt jwt) {
		myPlanWorkoutService.deleteExercise(exerciseId, jwt.getSubject());
	}

	@GetMapping("/plan")
	public List<WorkoutPlanDayResponse> getWorkoutPlan(@AuthenticationPrincipal Jwt jwt) {
		return myPlanWorkoutService.getWorkoutPlan(jwt.getSubject());
	}

	@PostMapping("/plan/days")
	@ResponseStatus(HttpStatus.CREATED)
	public WorkoutPlanDayResponse addWorkoutPlanDay(
			@Validated @RequestBody(required = false) AddWorkoutPlanDayRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanWorkoutService.addWorkoutPlanDay(
				request == null ? new AddWorkoutPlanDayRequest(null, null) : request, jwt.getSubject());
	}

	@PatchMapping("/plan/days/{dayId}")
	public WorkoutPlanDayResponse updateWorkoutPlanDay(
			@PathVariable UUID dayId,
			@Validated @RequestBody UpdateWorkoutPlanDayRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanWorkoutService.updateWorkoutPlanDay(dayId, request, jwt.getSubject());
	}

	@DeleteMapping("/plan/days/{dayId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteWorkoutPlanDay(@PathVariable UUID dayId, @AuthenticationPrincipal Jwt jwt) {
		myPlanWorkoutService.deleteWorkoutPlanDay(dayId, jwt.getSubject());
	}

	@PatchMapping("/plan/days/reorder")
	public List<WorkoutPlanDayResponse> reorderWorkoutPlanDays(
			@Validated @RequestBody ReorderWorkoutPlanDaysRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanWorkoutService.reorderWorkoutPlanDays(request, jwt.getSubject());
	}

	@PostMapping("/plan/days/{dayId}/exercises")
	@ResponseStatus(HttpStatus.CREATED)
	public WorkoutPlanDayExerciseResponse addWorkoutPlanDayExercise(
			@PathVariable UUID dayId,
			@Validated @RequestBody AddWorkoutPlanDayExerciseRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanWorkoutService.addWorkoutPlanDayExercise(dayId, request, jwt.getSubject());
	}

	@PatchMapping("/plan/days/{dayId}/exercises/{itemId}")
	public WorkoutPlanDayExerciseResponse updateWorkoutPlanDayExercise(
			@PathVariable UUID dayId,
			@PathVariable UUID itemId,
			@Validated @RequestBody UpdateWorkoutPlanDayExerciseRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanWorkoutService.updateWorkoutPlanDayExercise(dayId, itemId, request, jwt.getSubject());
	}

	@DeleteMapping("/plan/days/{dayId}/exercises/{itemId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteWorkoutPlanDayExercise(
			@PathVariable UUID dayId,
			@PathVariable UUID itemId,
			@AuthenticationPrincipal Jwt jwt) {
		myPlanWorkoutService.deleteWorkoutPlanDayExercise(dayId, itemId, jwt.getSubject());
	}
}
