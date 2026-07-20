package com.fatfitness.api.myplan;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
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
class MyPlanGlp1ControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	// --- Auth enforcement ---

	@Test
	void getEntriesRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/myplan/glp1/entries"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void postEntryRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/myplan/glp1/entries")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 5.0 }
								"""))
				.andExpect(status().isUnauthorized());
	}

	// --- Entries ---

	@Test
	void getEntriesReturnsEmptyListInitially() throws Exception {
		String token = registerVerifyAndLogin("glp1-empty@example.com");

		mockMvc.perform(get("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void addEntryReturnsCreatedWithFields() throws Exception {
		String token = registerVerifyAndLogin("glp1-add@example.com");

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 5.0, "notes": "left thigh" }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNotEmpty())
				.andExpect(jsonPath("$.entryDate").value("2026-07-01"))
				.andExpect(jsonPath("$.doseMg").value(5.0))
				.andExpect(jsonPath("$.notes").value("left thigh"))
				.andExpect(jsonPath("$.updatedAt").isNotEmpty());
	}

	@Test
	void addEntryWithoutNotesLeavesItNull() throws Exception {
		String token = registerVerifyAndLogin("glp1-no-notes@example.com");

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 2.5 }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.notes").value(nullValue()));
	}

	@Test
	void addedEntryAppearsInEntriesList() throws Exception {
		String token = registerVerifyAndLogin("glp1-list@example.com");

		mockMvc.perform(post("/api/myplan/glp1/entries")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "entryDate": "2026-07-01", "doseMg": 5.0 }
						"""));

		mockMvc.perform(get("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].entryDate").value("2026-07-01"))
				.andExpect(jsonPath("$[0].doseMg").value(5.0));
	}

	@Test
	void entriesAreReturnedInAscendingDateOrder() throws Exception {
		String token = registerVerifyAndLogin("glp1-order@example.com");

		mockMvc.perform(post("/api/myplan/glp1/entries")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "entryDate": "2026-07-10", "doseMg": 5.0 }
						"""));

		mockMvc.perform(post("/api/myplan/glp1/entries")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "entryDate": "2026-07-01", "doseMg": 2.5 }
						"""));

		mockMvc.perform(get("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(2)))
				.andExpect(jsonPath("$[0].entryDate").value("2026-07-01"))
				.andExpect(jsonPath("$[1].entryDate").value("2026-07-10"));
	}

	@Test
	void multipleEntriesOnTheSameDateAreAllowed() throws Exception {
		String token = registerVerifyAndLogin("glp1-same-date@example.com");

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 5.0 }
								"""))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 2.5, "notes": "correction" }
								"""))
				.andExpect(status().isCreated());

		mockMvc.perform(get("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(2)));
	}

	@Test
	void addEntryRejectsMissingDate() throws Exception {
		String token = registerVerifyAndLogin("glp1-missing-date@example.com");

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "doseMg": 5.0 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addEntryRejectsMissingDose() throws Exception {
		String token = registerVerifyAndLogin("glp1-missing-dose@example.com");

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01" }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addEntryRejectsDoseBelowMinimum() throws Exception {
		String token = registerVerifyAndLogin("glp1-min-dose@example.com");

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 0 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addEntryRejectsOutOfRangeDose() throws Exception {
		String token = registerVerifyAndLogin("glp1-max-dose@example.com");

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 10000 }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addEntryRejectsOversizedNotes() throws Exception {
		String token = registerVerifyAndLogin("glp1-oversized-notes@example.com");
		String longNotes = "x".repeat(1001);

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 5.0, "notes": "%s" }
								""".formatted(longNotes)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void updateEntryChangesFields() throws Exception {
		String token = registerVerifyAndLogin("glp1-update@example.com");
		String entryId = addEntryAndReturnId(token, "2026-07-01", "5.0", null);

		mockMvc.perform(patch("/api/myplan/glp1/entries/{id}", entryId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-02", "doseMg": 7.5, "notes": "updated" }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.entryDate").value("2026-07-02"))
				.andExpect(jsonPath("$.doseMg").value(7.5))
				.andExpect(jsonPath("$.notes").value("updated"));
	}

	@Test
	void deleteEntryRemovesIt() throws Exception {
		String token = registerVerifyAndLogin("glp1-delete@example.com");
		String entryId = addEntryAndReturnId(token, "2026-07-01", "5.0", null);

		mockMvc.perform(delete("/api/myplan/glp1/entries/{id}", entryId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	// --- Linked weight entry ---

	@Test
	void addEntryWithWeightCreatesLinkedWeightEntry() throws Exception {
		String token = registerVerifyAndLogin("glp1-weight-create@example.com");

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 5.0, "weightKg": 160.5 }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.weightKg").value(160.5));

		mockMvc.perform(get("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].entryDate").value("2026-07-01"))
				.andExpect(jsonPath("$[0].weightKg").value(160.5));
	}

	@Test
	void addEntryWithoutWeightLeavesWeightEntriesUntouched() throws Exception {
		String token = registerVerifyAndLogin("glp1-no-weight@example.com");

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 5.0 }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.weightKg").value(nullValue()));

		mockMvc.perform(get("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void addEntryWithWeightOnExistingDateUpdatesInsteadOfDuplicating() throws Exception {
		String token = registerVerifyAndLogin("glp1-weight-update@example.com");

		mockMvc.perform(post("/api/myplan/weight/entries")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "entryDate": "2026-07-01", "weightKg": 160.5 }
						"""));

		mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 5.0, "weightKg": 159.0 }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.weightKg").value(159.0));

		mockMvc.perform(get("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].weightKg").value(159.0));
	}

	@Test
	void deletingEntryCascadesItsLinkedWeightEntry() throws Exception {
		String token = registerVerifyAndLogin("glp1-cascade-delete@example.com");
		String entryId = addEntryWithWeightAndReturnId(token, "2026-07-01", "5.0", "160.5");

		mockMvc.perform(delete("/api/myplan/glp1/entries/{id}", entryId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void deletingEntryDoesNotRemoveAnIndependentlyLoggedWeightEntry() throws Exception {
		String token = registerVerifyAndLogin("glp1-keep-independent@example.com");

		// Weight already logged on its own before any GLP-1 entry exists for the date.
		mockMvc.perform(post("/api/myplan/weight/entries")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "entryDate": "2026-07-01", "weightKg": 160.5 }
						"""));

		String entryId = addEntryAndReturnId(token, "2026-07-01", "5.0", null);

		mockMvc.perform(delete("/api/myplan/glp1/entries/{id}", entryId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		// The weight entry was never owned by the GLP-1 entry, so it survives.
		mockMvc.perform(get("/api/myplan/weight/entries")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].weightKg").value(160.5));
	}

	@Test
	void entriesAreIsolatedPerUser() throws Exception {
		String tokenA = registerVerifyAndLogin("glp1-isolation-a@example.com");
		String tokenB = registerVerifyAndLogin("glp1-isolation-b@example.com");

		String entryId = addEntryAndReturnId(tokenA, "2026-07-01", "5.0", null);

		mockMvc.perform(get("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + tokenB))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));

		mockMvc.perform(patch("/api/myplan/glp1/entries/{id}", entryId)
						.header("Authorization", "Bearer " + tokenB)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "2026-07-01", "doseMg": 1.0 }
								"""))
				.andExpect(status().isNotFound());

		mockMvc.perform(delete("/api/myplan/glp1/entries/{id}", entryId)
						.header("Authorization", "Bearer " + tokenB))
				.andExpect(status().isNotFound());
	}

	// --- Helpers ---

	private String addEntryAndReturnId(String token, String entryDate, String doseMg, String notes)
			throws Exception {
		String body = notes == null
				? """
						{ "entryDate": "%s", "doseMg": %s }
						""".formatted(entryDate, doseMg)
				: """
						{ "entryDate": "%s", "doseMg": %s, "notes": "%s" }
						""".formatted(entryDate, doseMg, notes);

		MvcResult result = mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(body))
				.andExpect(status().isCreated())
				.andReturn();

		return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
	}

	private String addEntryWithWeightAndReturnId(String token, String entryDate, String doseMg, String weightKg)
			throws Exception {
		MvcResult result = mockMvc.perform(post("/api/myplan/glp1/entries")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "entryDate": "%s", "doseMg": %s, "weightKg": %s }
								""".formatted(entryDate, doseMg, weightKg)))
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
