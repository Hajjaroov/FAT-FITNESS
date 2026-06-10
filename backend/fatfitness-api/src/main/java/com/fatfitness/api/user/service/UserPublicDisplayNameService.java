package com.fatfitness.api.user.service;

import org.springframework.stereotype.Service;

import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserStatus;

@Service
public class UserPublicDisplayNameService {

	public String resolve(UserAccount user) {
		if (user.getStatus() == UserStatus.DELETED) {
			return "Deleted account";
		}

		if (user.getStatus() == UserStatus.BANNED) {
			return "Banned account";
		}

		return user.getDisplayName();
	}
}
