package com.fatfitness.api.push.service;

public record PushSendOutcome(int statusCode) {

	public boolean isExpired() {
		return statusCode == 404 || statusCode == 410;
	}
}
