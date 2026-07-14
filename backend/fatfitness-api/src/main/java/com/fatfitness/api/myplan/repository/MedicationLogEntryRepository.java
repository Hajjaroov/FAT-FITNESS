package com.fatfitness.api.myplan.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.myplan.entity.MedicationLogEntry;

public interface MedicationLogEntryRepository extends JpaRepository<MedicationLogEntry, UUID> {

	List<MedicationLogEntry> findByUserIdOrderByEntryDateAsc(UUID userId);

	Optional<MedicationLogEntry> findByIdAndUserId(UUID id, UUID userId);
}
