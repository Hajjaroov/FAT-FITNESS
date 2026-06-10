package com.fatfitness.api.status;

import java.time.Instant;

public record StatusResponse(
		String service,
		String status,
		Instant timestamp
) {
}
