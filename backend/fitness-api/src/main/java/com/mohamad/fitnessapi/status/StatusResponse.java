package com.mohamad.fitnessapi.status;

import java.time.Instant;

public record StatusResponse(
		String service,
		String status,
		Instant timestamp
) {
}
