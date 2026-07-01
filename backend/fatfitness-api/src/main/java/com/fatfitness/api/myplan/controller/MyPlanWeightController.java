package com.fatfitness.api.myplan.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fatfitness.api.myplan.dto.AddWeightEntryRequest;
import com.fatfitness.api.myplan.dto.UpdateWeightGoalsRequest;
import com.fatfitness.api.myplan.dto.WeightEntryResponse;
import com.fatfitness.api.myplan.dto.WeightGoalResponse;
import com.fatfitness.api.myplan.service.MyPlanWeightService;

@RestController
@RequestMapping("/api/myplan/weight")
public class MyPlanWeightController {

	private final MyPlanWeightService myPlanWeightService;

	public MyPlanWeightController(MyPlanWeightService myPlanWeightService) {
		this.myPlanWeightService = myPlanWeightService;
	}

	@GetMapping("/goals")
	public WeightGoalResponse getWeightGoals(@AuthenticationPrincipal Jwt jwt) {
		return myPlanWeightService.getWeightGoals(jwt.getSubject());
	}

	@PatchMapping("/goals")
	public WeightGoalResponse updateWeightGoals(
			@AuthenticationPrincipal Jwt jwt,
			@Validated @RequestBody UpdateWeightGoalsRequest request) {
		return myPlanWeightService.updateWeightGoals(jwt.getSubject(), request);
	}

	@GetMapping("/entries")
	public List<WeightEntryResponse> getWeightEntries(@AuthenticationPrincipal Jwt jwt) {
		return myPlanWeightService.getWeightEntries(jwt.getSubject());
	}

	@PostMapping("/entries")
	@ResponseStatus(HttpStatus.CREATED)
	public WeightEntryResponse addWeightEntry(
			@AuthenticationPrincipal Jwt jwt,
			@Validated @RequestBody AddWeightEntryRequest request) {
		return myPlanWeightService.addWeightEntry(jwt.getSubject(), request);
	}
}
