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

import com.fatfitness.api.myplan.dto.AddMedicationLogEntryRequest;
import com.fatfitness.api.myplan.dto.MedicationLogEntryResponse;
import com.fatfitness.api.myplan.dto.UpdateMedicationLogEntryRequest;
import com.fatfitness.api.myplan.service.MyPlanGlp1Service;

@RestController
@RequestMapping("/api/myplan/glp1")
public class MyPlanGlp1Controller {

	private final MyPlanGlp1Service myPlanGlp1Service;

	public MyPlanGlp1Controller(MyPlanGlp1Service myPlanGlp1Service) {
		this.myPlanGlp1Service = myPlanGlp1Service;
	}

	@GetMapping("/entries")
	public List<MedicationLogEntryResponse> getEntries(@AuthenticationPrincipal Jwt jwt) {
		return myPlanGlp1Service.getEntries(jwt.getSubject());
	}

	@PostMapping("/entries")
	@ResponseStatus(HttpStatus.CREATED)
	public MedicationLogEntryResponse addEntry(
			@Validated @RequestBody AddMedicationLogEntryRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanGlp1Service.addEntry(request, jwt.getSubject());
	}

	@PatchMapping("/entries/{entryId}")
	public MedicationLogEntryResponse updateEntry(
			@PathVariable UUID entryId,
			@Validated @RequestBody UpdateMedicationLogEntryRequest request,
			@AuthenticationPrincipal Jwt jwt) {
		return myPlanGlp1Service.updateEntry(entryId, request, jwt.getSubject());
	}

	@DeleteMapping("/entries/{entryId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteEntry(@PathVariable UUID entryId, @AuthenticationPrincipal Jwt jwt) {
		myPlanGlp1Service.deleteEntry(entryId, jwt.getSubject());
	}
}
