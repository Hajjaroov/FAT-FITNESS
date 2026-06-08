package com.mohamad.fitnessapi.status;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class StatusControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void statusEndpointReturnsServiceStatus() throws Exception {
		mockMvc.perform(get("/api/status")
						.header("Origin", "http://localhost:3000"))
				.andExpect(status().isOk())
				.andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
				.andExpect(jsonPath("$.service").value("fitness-api"))
				.andExpect(jsonPath("$.status").value("UP"))
				.andExpect(jsonPath("$.timestamp", notNullValue()));
	}

	@Test
	void statusEndpointAllowsFrontendCorsPreflight() throws Exception {
		mockMvc.perform(options("/api/status")
						.header("Origin", "http://localhost:3000")
						.header("Access-Control-Request-Method", "GET"))
				.andExpect(status().isOk())
				.andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
	}
}
