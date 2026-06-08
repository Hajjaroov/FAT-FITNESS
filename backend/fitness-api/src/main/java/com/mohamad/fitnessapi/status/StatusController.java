package com.mohamad.fitnessapi.status;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/status")
public class StatusController {

	private final String serviceName;

	public StatusController(@Value("${spring.application.name:fitness-api}") String serviceName) {
		this.serviceName = serviceName;
	}

	@GetMapping
	public StatusResponse getStatus() {
		return new StatusResponse(serviceName, "UP", Instant.now());
	}
}
