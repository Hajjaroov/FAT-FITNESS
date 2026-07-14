package com.fatfitness.api.myplan.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.myplan.dto.AddMedicationLogEntryRequest;
import com.fatfitness.api.myplan.dto.MedicationLogEntryResponse;
import com.fatfitness.api.myplan.dto.UpdateMedicationLogEntryRequest;
import com.fatfitness.api.myplan.entity.MedicationLogEntry;
import com.fatfitness.api.myplan.repository.MedicationLogEntryRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Service
public class MyPlanGlp1Service {

	private final UserAccountRepository userAccountRepository;
	private final MedicationLogEntryRepository medicationLogEntryRepository;

	public MyPlanGlp1Service(
			UserAccountRepository userAccountRepository,
			MedicationLogEntryRepository medicationLogEntryRepository) {
		this.userAccountRepository = userAccountRepository;
		this.medicationLogEntryRepository = medicationLogEntryRepository;
	}

	public List<MedicationLogEntryResponse> getEntries(String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		return medicationLogEntryRepository.findByUserIdOrderByEntryDateAsc(user.getId())
				.stream()
				.map(MyPlanGlp1Service::toResponse)
				.toList();
	}

	@Transactional
	public MedicationLogEntryResponse addEntry(AddMedicationLogEntryRequest request, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		MedicationLogEntry entry = medicationLogEntryRepository.save(new MedicationLogEntry(
				user,
				request.entryDate(),
				request.doseMg(),
				cleanOptional(request.notes())));
		return toResponse(entry);
	}

	@Transactional
	public MedicationLogEntryResponse updateEntry(
			UUID entryId,
			UpdateMedicationLogEntryRequest request,
			String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		MedicationLogEntry entry = requireOwnedEntry(entryId, user.getId());
		entry.update(request.entryDate(), request.doseMg(), cleanOptional(request.notes()));
		entry = medicationLogEntryRepository.save(entry);
		return toResponse(entry);
	}

	@Transactional
	public void deleteEntry(UUID entryId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		MedicationLogEntry entry = requireOwnedEntry(entryId, user.getId());
		medicationLogEntryRepository.delete(entry);
	}

	private MedicationLogEntry requireOwnedEntry(UUID entryId, UUID userId) {
		return medicationLogEntryRepository.findByIdAndUserId(entryId, userId)
				.orElseThrow(() -> notFound("Medication log entry"));
	}

	private UserAccount requireActiveUser(String userIdSubject) {
		UserAccount user = userAccountRepository.findById(parseUserIdSubject(userIdSubject))
				.orElseThrow(MyPlanGlp1Service::invalidAccessToken);

		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
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

	private static MedicationLogEntryResponse toResponse(MedicationLogEntry entry) {
		return new MedicationLogEntryResponse(
				entry.getId(),
				entry.getEntryDate(),
				entry.getDoseMg(),
				entry.getNotes(),
				entry.getUpdatedAt());
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
