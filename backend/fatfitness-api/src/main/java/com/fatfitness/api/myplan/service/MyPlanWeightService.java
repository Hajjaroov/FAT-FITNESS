package com.fatfitness.api.myplan.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.myplan.dto.AddWeightEntryRequest;
import com.fatfitness.api.myplan.dto.UpdateWeightGoalsRequest;
import com.fatfitness.api.myplan.dto.WeightEntryResponse;
import com.fatfitness.api.myplan.dto.WeightGoalResponse;
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
				.map(e -> new WeightEntryResponse(e.getId(), e.getEntryDate(), e.getWeightKg(), e.getCreatedAt()))
				.toList();
	}

	@Transactional
	public WeightEntryResponse addWeightEntry(String userIdSubject, AddWeightEntryRequest request) {
		UserAccount user = requireActiveUser(userIdSubject);
		if (weightEntryRepository.existsByUserIdAndEntryDate(user.getId(), request.entryDate())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"An entry for " + request.entryDate() + " already exists");
		}
		WeightEntry entry = weightEntryRepository.save(new WeightEntry(user, request.entryDate(), request.weightKg()));
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
