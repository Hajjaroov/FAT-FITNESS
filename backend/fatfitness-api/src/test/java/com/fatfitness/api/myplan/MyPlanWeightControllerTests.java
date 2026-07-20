package com.fatfitness.api.myplan;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fatfitness.api.auth.service.EmailVerificationTokenService;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MyPlanWeightControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	// --- Auth enforcement ---

	@Test
	void getGoalsRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/myplan/weight/goals"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void patchGoalsRequiresAuthentication() throws Exception {
		mockMvc.perform(patch("/api/myplan/weight/goals")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "startWeight": 200.0, "goalWeight": 120.0 }
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void getEntriesRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/myplan/weight/entries"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void postEntryRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/myplan/weight/entries")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "weightKg": 160.0 }
								"""))
				.andExpect(status().isUnauthorized());
	}

	// --- Weight goals ---

	@Test
	void getGoalsReturnsNullFieldsWhenNotSet() throws Exception {
		String token = registerVerifyAndLogin("goals-empty@example.com");

		mockMvc.perform(get("/api/myplan/weight/goals")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.startWeight").isEmpty())
				.andExpect(jsonPath("$.goalWeight").isEmpty())
				.andExpect(jsonPath("$.updatedAt").isEmpty());
	}

	@Test
	void patchGoalsSetsAndReturnsValues() throws Exception {
		String token = registerVerifyAndLogin("goals-set@example.com");

		mockMvc.perform(patch("/api/myplan/weight/goals")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "startWeight": 203.0, "goalWeight": 120.0 }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.startWeight").value(203.0))
				.andExpect(jsonPath("$.goalWeight").value(120.0))
				.andExpect(jsonPath("$.updatedAt").isNotEmpty());
	}

	@Test
	void getGoalsReflectsValuesAfterPatch() throws Exception {
		String token = registerVerifyAndLogin("goals-get-after-patch@example.com");

		mockMvc.perform(patch("/api/myplan/weight/goals")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "startWeight": 203.0, "goalWeight": 120.0 }
						"""));

		mockMvc.perform(get("/api/myplan/weight/goals")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.startWeight").value(203.0))
				.andExpect(jsonPath("$.goalWeight").value(120.0));
	}

	@Test
	void patchGoalsUpdatesExistingGoals() throws Exception {
		String token = registerVerifyAndLogin("goals-update@example.com");

		mockMvc.perform(patch("/api/myplan/weight/goals")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "startWeight": 203.0, "goalWeight": 120.0 }
						"""));

		mockMvc.perform(patch("/api/myplan/weight/goals")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "startWeight": 200.0, "goalWeight": 100.0 }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.startWeight").value(200.0))
				.andExpect(jsonPath("$.goalWeight").value(100.0));
	}

	@Test
	void patchGoalsRejectsMissingStartWeight() throws Exception {
		String token = registerVerifyAndLogin("goals-missing-start@example.com");

		mockMvc.perform(patch("/api/myplan/weight/goals")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "goalWeight": 120.0 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void patchGoalsRejectsMissingGoalWeight() throws Exception {
		String token = registerVerifyAndLogin("goals-missing-goal@example.com");

		mockMvc.perform(patch("/api/myplan/weight/goals")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "startWeight": 203.0 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void patchGoalsRejectsWeightBelowMinimum() throws Exception {
		String token = registerVerifyAndLogin("goals-min-weight@example.com");

		mockMvc.perform(patch("/api/myplan/weight/goals")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "startWeight": 0.5, "goalWeight": 120.0 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void patchGoalsRejectsOutOfRangeWeight() throws Exception {
		String token = registerVerifyAndLogin("goals-max-weight@example.com");

		mockMvc.perform(patch("/api/myplan/weight/goals")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "startWeight": 10000, "goalWeight": 120.0 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void goalsAreIsolatedPerUser() throws Exception {
		String tokenA = registerVerifyAndLogin("goals-isolation-a@example.com");
		String tokenB = registerVerifyAndLogin("goals-isolation-b@example.com");

		mockMvc.perform(patch("/api/myplan/weight/goals")
				.header("Authorization", "Bearer " + tokenA)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "startWeight": 203.0, "goalWeight": 120.0 }
						"""));

		mockMvc.perform(get("/api/myplan/weight/goals")
						.header("Authorization", "Bearer " + tokenB))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.startWeight").isEmpty())
				.andExpect(jsonPath("$.goalWeight").isEmpty());
	}

	// --- Weight entries ---

	@Test
	void getEntriesReturnsEmptyListInitially() throws Exception {
		String token = registerVerifyAndLogin("entries-empty@example.com");

		mockMvc.perform(get("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void addEntryReturnsCreatedWithFields() throws Exception {
		String token = registerVerifyAndLogin("entry-add@example.com");

		mockMvc.perform(post("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "weightKg": 160.5 }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNotEmpty())
				.andExpect(jsonPath("$.entryDate").value("2026-07-01"))
				.andExpect(jsonPath("$.weightKg").value(160.5))
				.andExpect(jsonPath("$.createdAt").isNotEmpty());
	}

	@Test
	void addedEntryAppearsInEntriesList() throws Exception {
		String token = registerVerifyAndLogin("entry-list@example.com");

		mockMvc.perform(post("/api/myplan/weight/entries")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "entryDate": "2026-07-01", "weightKg": 160.5 }
						"""));

		mockMvc.perform(get("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].entryDate").value("2026-07-01"))
				.andExpect(jsonPath("$[0].weightKg").value(160.5));
	}

	@Test
	void entriesAreReturnedInAscendingDateOrder() throws Exception {
		String token = registerVerifyAndLogin("entry-order@example.com");

		mockMvc.perform(post("/api/myplan/weight/entries")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "entryDate": "2026-07-10", "weightKg": 158.0 }
						"""));

		mockMvc.perform(post("/api/myplan/weight/entries")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "entryDate": "2026-07-01", "weightKg": 160.5 }
						"""));

		mockMvc.perform(get("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(2)))
				.andExpect(jsonPath("$[0].entryDate").value("2026-07-01"))
				.andExpect(jsonPath("$[1].entryDate").value("2026-07-10"));
	}

	@Test
	void duplicateDateEntryUpdatesWeightInsteadOfDuplicating() throws Exception {
		String token = registerVerifyAndLogin("entry-duplicate@example.com");

		mockMvc.perform(post("/api/myplan/weight/entries")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "entryDate": "2026-07-01", "weightKg": 160.5 }
						"""));

		mockMvc.perform(post("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "weightKg": 161.0 }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.entryDate").value("2026-07-01"))
				.andExpect(jsonPath("$.weightKg").value(161.0));

		mockMvc.perform(get("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].weightKg").value(161.0));
	}

	@Test
	void addEntryRejectsMissingDate() throws Exception {
		String token = registerVerifyAndLogin("entry-missing-date@example.com");

		mockMvc.perform(post("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "weightKg": 160.0 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addEntryRejectsMissingWeight() throws Exception {
		String token = registerVerifyAndLogin("entry-missing-weight@example.com");

		mockMvc.perform(post("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01" }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addEntryRejectsWeightBelowMinimum() throws Exception {
		String token = registerVerifyAndLogin("entry-min-weight@example.com");

		mockMvc.perform(post("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "weightKg": 0.5 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addEntryRejectsOutOfRangeWeight() throws Exception {
		String token = registerVerifyAndLogin("entry-max-weight@example.com");

		mockMvc.perform(post("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "weightKg": 10000 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void entriesAreIsolatedPerUser() throws Exception {
		String tokenA = registerVerifyAndLogin("entry-isolation-a@example.com");
		String tokenB = registerVerifyAndLogin("entry-isolation-b@example.com");

		mockMvc.perform(post("/api/myplan/weight/entries")
				.header("Authorization", "Bearer " + tokenA)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "entryDate": "2026-07-01", "weightKg": 160.5 }
						"""));

		mockMvc.perform(get("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + tokenB))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	// --- Update / delete ---

	@Test
	void updateEntryChangesWeight() throws Exception {
		String token = registerVerifyAndLogin("entry-update@example.com");
		String entryId = addEntryAndReturnId(token, "2026-07-01", "160.5");

		mockMvc.perform(patch("/api/myplan/weight/entries/{id}", entryId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "weightKg": 158.2 }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.entryDate").value("2026-07-01"))
				.andExpect(jsonPath("$.weightKg").value(158.2));
	}

	@Test
	void updateEntryRejectsMissingWeight() throws Exception {
		String token = registerVerifyAndLogin("entry-update-missing@example.com");
		String entryId = addEntryAndReturnId(token, "2026-07-01", "160.5");

		mockMvc.perform(patch("/api/myplan/weight/entries/{id}", entryId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{}"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void updateEntryOnUnknownIdReturnsNotFound() throws Exception {
		String token = registerVerifyAndLogin("entry-update-unknown@example.com");

		mockMvc.perform(patch("/api/myplan/weight/entries/{id}", "00000000-0000-0000-0000-000000000000")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "weightKg": 158.2 }
								"""))
				.andExpect(status().isNotFound());
	}

	@Test
	void deleteEntryRemovesIt() throws Exception {
		String token = registerVerifyAndLogin("entry-delete@example.com");
		String entryId = addEntryAndReturnId(token, "2026-07-01", "160.5");

		mockMvc.perform(delete("/api/myplan/weight/entries/{id}", entryId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void updateAndDeleteAreIsolatedPerUser() throws Exception {
		String tokenA = registerVerifyAndLogin("entry-update-delete-isolation-a@example.com");
		String tokenB = registerVerifyAndLogin("entry-update-delete-isolation-b@example.com");
		String entryId = addEntryAndReturnId(tokenA, "2026-07-01", "160.5");

		mockMvc.perform(patch("/api/myplan/weight/entries/{id}", entryId)
						.header("Authorization", "Bearer " + tokenB)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "weightKg": 100.0 }
								"""))
				.andExpect(status().isNotFound());

		mockMvc.perform(delete("/api/myplan/weight/entries/{id}", entryId)
						.header("Authorization", "Bearer " + tokenB))
				.andExpect(status().isNotFound());
	}

	// --- Helpers ---

	private String addEntryAndReturnId(String token, String entryDate, String weightKg) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "%s", "weightKg": %s }
								""".formatted(entryDate, weightKg)))
				.andExpect(status().isCreated())
				.andReturn();

		return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
	}

	private String registerVerifyAndLogin(String email) throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "Test User",
								  "email": "%s",
								  "countryRegionCode": "DE",
								  "password": "very-secret-password",
								  "confirmPassword": "very-secret-password",
								  "acceptedCommunityRules": true,
								  "acceptedPrivacyPolicy": true
								}
								""".formatted(email)))
				.andExpect(status().isCreated());

		UserAccount user = userAccountRepository.findByEmail(email.toLowerCase()).orElseThrow();
		var created = emailVerificationTokenService.createFor(user);

		mockMvc.perform(post("/api/auth/verify-email")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "token": "%s" }
								""".formatted(created.rawToken())))
				.andExpect(status().isOk());

		MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "%s",
								  "password": "very-secret-password",
								  "clientType": "MOBILE",
								  "deviceLabel": "Test client"
								}
								""".formatted(email)))
				.andExpect(status().isOk())
				.andReturn();

		return JsonPath.read(loginResult.getResponse().getContentAsString(), "$.accessToken");
	}
}
