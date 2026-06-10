package com.fatfitness.api.user.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatfitness.api.user.entity.UserAccount;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {

	Optional<UserAccount> findByEmail(String email);

	boolean existsByEmail(String email);
}
