package com.fatfitness.api.myplan.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.myplan.entity.WeightEntry;

public interface WeightEntryRepository extends JpaRepository<WeightEntry, UUID> {

	List<WeightEntry> findByUserIdOrderByEntryDateAsc(UUID userId);

	Optional<WeightEntry> findByUserIdAndEntryDate(UUID userId, LocalDate entryDate);

	Optional<WeightEntry> findByIdAndUserId(UUID id, UUID userId);

	Optional<WeightEntry> findBySourceMedicationEntryId(UUID sourceMedicationEntryId);
}
