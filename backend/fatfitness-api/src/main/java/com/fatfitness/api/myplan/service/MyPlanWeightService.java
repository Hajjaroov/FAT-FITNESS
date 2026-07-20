package com.fatfitness.api.myplan.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.myplan.dto.AddWeightEntryRequest;
import com.fatfitness.api.myplan.dto.UpdateWeightEntryRequest;
import com.fatfitness.api.myplan.dto.UpdateWeightGoalsRequest;
import com.fatfitness.api.myplan.dto.WeightEntryResponse;
import com.fatfitness.api.myplan.dto.WeightGoalResponse;
import com.fatfitness.api.myplan.entity.MedicationLogEntry;
import com.fatfitness.api.myplan.entity.UserWeightGoal;
import com.fatfitness.api.myplan.entity.WeightEntry;
import com.fatfitness.api.myplan.repository.UserWeightGoalRepository;
import com.fatfitness.api.myplan.repository.WeightEntryRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Service
public class MyPlanWeightService {

	private final UserAccountRepository userAccountRepository;
	private final UserWeightGoalRepository weightGoalRepository;
	private final WeightEntryRepository weightEntryRepository;

	public MyPlanWeightService(
			UserAccountRepository userAccountRepository,
			UserWeightGoalRepository weightGoalRepository,
			WeightEntryRepository weightEntryRepository) {
		this.userAccountRepository = userAccountRepository;
		this.weightGoalRepository = weightGoalRepository;
		this.weightEntryRepository = weightEntryRepository;
	}

	public WeightGoalResponse getWeightGoals(String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		return weightGoalRepository.findByUserId(user.getId())
				.map(g -> new WeightGoalResponse(g.getStartWeight(), g.getGoalWeight(), g.getUpdatedAt()))
				.orElse(new WeightGoalResponse(null, null, null));
	}

	@Transactional
	public WeightGoalResponse updateWeightGoals(String userIdSubject, UpdateWeightGoalsRequest request) {
		UserAccount user = requireActiveUser(userIdSubject);
		UserWeightGoal goal = weightGoalRepository.findByUserId(user.getId())
				.orElseGet(() -> new UserWeightGoal(user));
		goal.updateGoals(request.startWeight(), request.goalWeight());
		goal = weightGoalRepository.save(goal);
		return new WeightGoalResponse(goal.getStartWeight(), goal.getGoalWeight(), goal.getUpdatedAt());
	}

	public List<WeightEntryResponse> getWeightEntries(String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		return weightEntryRepository.findByUserIdOrderByEntryDateAsc(user.getId())
				.stream()
				.map(MyPlanWeightService::toResponse)
				.toList();
	}

	@Transactional
	public WeightEntryResponse addWeightEntry(String userIdSubject, AddWeightEntryRequest request) {
		UserAccount user = requireActiveUser(userIdSubject);
		WeightEntry entry = upsertEntryForDate(user, request.entryDate(), request.weightKg(), null);
		return toResponse(entry);
	}

	@Transactional
	public WeightEntryResponse updateWeightEntry(String userIdSubject, UUID entryId, UpdateWeightEntryRequest request) {
		UserAccount user = requireActiveUser(userIdSubject);
		WeightEntry entry = requireOwnedEntry(entryId, user.getId());
		entry.updateWeightKg(request.weightKg());
		entry = weightEntryRepository.save(entry);
		return toResponse(entry);
	}

	@Transactional
	public void deleteWeightEntry(String userIdSubject, UUID entryId) {
		UserAccount user = requireActiveUser(userIdSubject);
		WeightEntry entry = requireOwnedEntry(entryId, user.getId());
		weightEntryRepository.delete(entry);
	}

	// Shared by the direct weight-entry add flow and the GLP-1 add flow (which
	// passes its own new MedicationLogEntry as sourceMedicationEntry so this
	// row can be cascade-deleted with it later). If a weight is already logged
	// for the date, its value is updated in place (never a 409) but ownership
	// is left untouched - a date collision with an existing, independently
	// logged entry must never silently attach it to this medication entry.
	@Transactional
	public WeightEntry upsertEntryForDate(
			UserAccount user, LocalDate entryDate, BigDecimal weightKg, MedicationLogEntry sourceMedicationEntry) {
		Optional<WeightEntry> existing = weightEntryRepository.findByUserIdAndEntryDate(user.getId(), entryDate);
		if (existing.isPresent()) {
			WeightEntry entry = existing.get();
			entry.updateWeightKg(weightKg);
			return weightEntryRepository.save(entry);
		}

		WeightEntry entry = new WeightEntry(user, entryDate, weightKg);
		if (sourceMedicationEntry != null) {
			entry.linkToMedicationEntry(sourceMedicationEntry);
		}
		return weightEntryRepository.save(entry);
	}

	// Deleting a MedicationLogEntry that owns a WeightEntry relies on the DB's
	// ON DELETE CASCADE (see V19) as the actual data-integrity guarantee, but
	// Hibernate's own session doesn't know about that DB-level cascade - if
	// this WeightEntry is already loaded in the current persistence context
	// (e.g. from the same request that just created it), a later query in the
	// same transaction throws TransientPropertyValueException on its now-
	// removed sourceMedicationEntry reference. Deleting it here first, through
	// Hibernate, keeps the session's own bookkeeping consistent - same fix
	// shape as DietMealItem.clearFood() for the foods ON DELETE SET NULL case.
	@Transactional
	public void deleteLinkedWeightEntry(MedicationLogEntry sourceMedicationEntry) {
		weightEntryRepository.findBySourceMedicationEntryId(sourceMedicationEntry.getId())
				.ifPresent(weightEntryRepository::delete);
	}

	private WeightEntry requireOwnedEntry(UUID entryId, UUID userId) {
		return weightEntryRepository.findByIdAndUserId(entryId, userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Weight entry not found"));
	}

	private static WeightEntryResponse toResponse(WeightEntry entry) {
		return new WeightEntryResponse(entry.getId(), entry.getEntryDate(), entry.getWeightKg(), entry.getCreatedAt());
	}

	private UserAccount requireActiveUser(String userIdSubject) {
		UserAccount user = userAccountRepository.findById(parseUserId(userIdSubject))
				.orElseThrow(MyPlanWeightService::invalidToken);
		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}
		return user;
	}

	private static UUID parseUserId(String subject) {
		try {
			return UUID.fromString(subject);
		}
		catch (RuntimeException ex) {
			throw invalidToken();
		}
	}

	private static ResponseStatusException invalidToken() {
		return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid access token");
	}
}
