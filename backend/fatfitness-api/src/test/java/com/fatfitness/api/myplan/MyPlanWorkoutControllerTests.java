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
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MyPlanWorkoutControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private EmailVerificationTokenService emailVerificationTokenService;

	// --- Auth enforcement ---

	@Test
	void getExercisesRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/myplan/workout/exercises"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void getPlanRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/myplan/workout/plan"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void postPlanDayRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/myplan/workout/plan/days"))
				.andExpect(status().isUnauthorized());
	}

	// --- Exercises (shared catalog) ---

	@Test
	void exercisesListStartsEmpty() throws Exception {
		String token = registerVerifyAndLogin("workout-empty@example.com");

		mockMvc.perform(get("/api/myplan/workout/exercises")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void customExerciseAutoJoinsSharedCatalogForOtherUsers() throws Exception {
		String tokenA = registerVerifyAndLogin("workout-custom-a@example.com");
		String tokenB = registerVerifyAndLogin("workout-custom-b@example.com");

		String dayId = addDay(tokenA, null, null);
		addItem(dayId, tokenA, "Workout Test Squats", "3 x 8-10");

		mockMvc.perform(get("/api/myplan/workout/exercises")
						.header("Authorization", "Bearer " + tokenB))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].name").value("Workout Test Squats"))
				.andExpect(jsonPath("$[0].photoSrc").value(nullValue()));
	}

	@Test
	void addingSameNamedExerciseTwiceReusesExistingCatalogEntry() throws Exception {
		String token = registerVerifyAndLogin("workout-dedup@example.com");
		String dayId = addDay(token, null, null);

		String firstExerciseId = addItemAndReturnExerciseId(dayId, token, "Workout Test Bench Press", "3 x 10");
		String secondExerciseId = addItemAndReturnExerciseId(dayId, token, "workout test BENCH press", "4 x 8");

		org.junit.jupiter.api.Assertions.assertEquals(firstExerciseId, secondExerciseId);

		mockMvc.perform(get("/api/myplan/workout/exercises")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)));
	}

	@Test
	void exerciseEditIsModeratorOnly() throws Exception {
		String user = registerVerifyAndLogin("workout-ex-edit-user@example.com");
		String moderator = registerVerifyAddRoleAndLogin("workout-ex-edit-mod@example.com", UserRole.MODERATOR);

		String dayId = addDay(user, null, null);
		String exerciseId = addItemAndReturnExerciseId(dayId, user, "Workout Test Rows", "3 x 12");

		String body = """
				{ "name": "Workout Test Barbell Rows", "nameDe": "Langhantelrudern" }
				""";

		mockMvc.perform(patch("/api/myplan/workout/exercises/{id}", exerciseId)
						.header("Authorization", "Bearer " + user)
						.contentType(MediaType.APPLICATION_JSON)
						.content(body))
				.andExpect(status().isForbidden());

		mockMvc.perform(patch("/api/myplan/workout/exercises/{id}", exerciseId)
						.header("Authorization", "Bearer " + moderator)
						.contentType(MediaType.APPLICATION_JSON)
						.content(body))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Workout Test Barbell Rows"))
				.andExpect(jsonPath("$.nameDe").value("Langhantelrudern"));
	}

	@Test
	void exerciseDeleteIsModeratorOnlyAndLeavesPlanItemsIntact() throws Exception {
		String user = registerVerifyAndLogin("workout-ex-del-user@example.com");
		String moderator = registerVerifyAddRoleAndLogin("workout-ex-del-mod@example.com", UserRole.MODERATOR);

		String dayId = addDay(user, null, null);
		String exerciseId = addItemAndReturnExerciseId(dayId, user, "Workout Test Curls", "3 x 15");

		mockMvc.perform(delete("/api/myplan/workout/exercises/{id}", exerciseId)
						.header("Authorization", "Bearer " + user))
				.andExpect(status().isForbidden());

		mockMvc.perform(delete("/api/myplan/workout/exercises/{id}", exerciseId)
						.header("Authorization", "Bearer " + moderator))
				.andExpect(status().isNoContent());

		// The user's plan item survives with its snapshotted name; only the
		// catalog link is cleared.
		mockMvc.perform(get("/api/myplan/workout/plan")
						.header("Authorization", "Bearer " + user))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].exercises", hasSize(1)))
				.andExpect(jsonPath("$[0].exercises[0].name").value("Workout Test Curls"))
				.andExpect(jsonPath("$[0].exercises[0].exerciseId").value(nullValue()));
	}

	// --- Plan days ---

	@Test
	void addDayUsesDefaultNumberedTitles() throws Exception {
		String token = registerVerifyAndLogin("workout-day-titles@example.com");

		mockMvc.perform(post("/api/myplan/workout/plan/days")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title").value("Day 1"))
				.andExpect(jsonPath("$.weekday").value(nullValue()));

		mockMvc.perform(post("/api/myplan/workout/plan/days")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title").value("Day 2"));
	}

	@Test
	void addDayWithTitleAndWeekday() throws Exception {
		String token = registerVerifyAndLogin("workout-day-weekday@example.com");

		mockMvc.perform(post("/api/myplan/workout/plan/days")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "title": "Upper A", "weekday": "MONDAY" }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title").value("Upper A"))
				.andExpect(jsonPath("$.weekday").value("MONDAY"));
	}

	@Test
	void addDayRejectsUnknownWeekday() throws Exception {
		String token = registerVerifyAndLogin("workout-day-bad-weekday@example.com");

		mockMvc.perform(post("/api/myplan/workout/plan/days")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "title": "Upper A", "weekday": "FUNDAY" }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addDayRejectsMoreThanFiftyBlocks() throws Exception {
		String token = registerVerifyAndLogin("workout-day-limit@example.com");

		for (int i = 0; i < 50; i++) {
			addDay(token, null, null);
		}

		mockMvc.perform(post("/api/myplan/workout/plan/days")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isBadRequest());
	}

	@Test
	void updateDayChangesTitleAndWeekday() throws Exception {
		String token = registerVerifyAndLogin("workout-day-rename@example.com");
		String dayId = addDay(token, "Push Day", "MONDAY");

		mockMvc.perform(patch("/api/myplan/workout/plan/days/{id}", dayId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "title": "Upper A", "weekday": "WEDNESDAY" }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("Upper A"))
				.andExpect(jsonPath("$.weekday").value("WEDNESDAY"));

		// Omitting weekday clears it (a block can go back to floating free,
		// like a warm-up protocol).
		mockMvc.perform(patch("/api/myplan/workout/plan/days/{id}", dayId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "title": "Warm-Up Protocol" }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("Warm-Up Protocol"))
				.andExpect(jsonPath("$.weekday").value(nullValue()));

		mockMvc.perform(delete("/api/myplan/workout/plan/days/{id}", dayId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/myplan/workout/plan")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void addDayAfterDeletingMiddleDayAvoidsPositionCollision() throws Exception {
		String token = registerVerifyAndLogin("workout-day-position@example.com");
		addDay(token, "A", null);
		String middleId = addDay(token, "B", null);
		addDay(token, "C", null);

		mockMvc.perform(delete("/api/myplan/workout/plan/days/{id}", middleId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		mockMvc.perform(post("/api/myplan/workout/plan/days")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.title").value("Day 4"));

		mockMvc.perform(get("/api/myplan/workout/plan")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(3)))
				.andExpect(jsonPath("$[0].title").value("A"))
				.andExpect(jsonPath("$[1].title").value("C"))
				.andExpect(jsonPath("$[2].title").value("Day 4"));
	}

	@Test
	void reorderDaysUpdatesPositions() throws Exception {
		String token = registerVerifyAndLogin("workout-day-reorder@example.com");
		String firstId = addDay(token, "First", null);
		String secondId = addDay(token, "Second", null);

		mockMvc.perform(patch("/api/myplan/workout/plan/days/reorder")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "orderedDayIds": ["%s", "%s"] }
								""".formatted(secondId, firstId)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].title").value("Second"))
				.andExpect(jsonPath("$[1].title").value("First"));
	}

	@Test
	void reorderDaysRejectsMismatchedIdSet() throws Exception {
		String token = registerVerifyAndLogin("workout-day-reorder-mismatch@example.com");
		addDay(token, "First", null);

		mockMvc.perform(patch("/api/myplan/workout/plan/days/reorder")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "orderedDayIds": ["00000000-0000-0000-0000-000000000000"] }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void reorderDaysRejectsDuplicateIds() throws Exception {
		String token = registerVerifyAndLogin("workout-day-reorder-duplicate@example.com");
		String firstId = addDay(token, "First", null);
		addDay(token, "Second", null);

		mockMvc.perform(patch("/api/myplan/workout/plan/days/reorder")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "orderedDayIds": ["%s", "%s"] }
								""".formatted(firstId, firstId)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void planDaysAreIsolatedPerUser() throws Exception {
		String tokenA = registerVerifyAndLogin("workout-isolation-a@example.com");
		String tokenB = registerVerifyAndLogin("workout-isolation-b@example.com");

		String dayId = addDay(tokenA, "Mine", null);

		mockMvc.perform(get("/api/myplan/workout/plan")
						.header("Authorization", "Bearer " + tokenB))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));

		mockMvc.perform(patch("/api/myplan/workout/plan/days/{id}", dayId)
						.header("Authorization", "Bearer " + tokenB)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "title": "Stolen" }
								"""))
				.andExpect(status().isNotFound());
	}

	// --- Plan day exercises ---

	@Test
	void addExerciseToDayStoresFreeTextSets() throws Exception {
		String token = registerVerifyAndLogin("workout-item-add@example.com");
		String dayId = addDay(token, null, null);

		mockMvc.perform(post("/api/myplan/workout/plan/days/{dayId}/exercises", dayId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Workout Test Deadlift", "sets": "3 x 8-10" }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.name").value("Workout Test Deadlift"))
				.andExpect(jsonPath("$.sets").value("3 x 8-10"));

		mockMvc.perform(post("/api/myplan/workout/plan/days/{dayId}/exercises", dayId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Workout Test March in place", "sets": "2 minutes" }
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.sets").value("2 minutes"));
	}

	@Test
	void addExerciseRejectsBlankSets() throws Exception {
		String token = registerVerifyAndLogin("workout-item-blank-sets@example.com");
		String dayId = addDay(token, null, null);

		mockMvc.perform(post("/api/myplan/workout/plan/days/{dayId}/exercises", dayId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Workout Test Undefined", "sets": "  " }
								"""))
				.andExpect(status().isBadRequest());
	}

	@Test
	void updateAndDeleteExerciseItem() throws Exception {
		String token = registerVerifyAndLogin("workout-item-update@example.com");
		String dayId = addDay(token, null, null);
		String itemId = addItemAndReturnItemId(dayId, token, "Workout Test Lunges", "3 x 10");

		mockMvc.perform(patch("/api/myplan/workout/plan/days/{dayId}/exercises/{itemId}", dayId, itemId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Workout Test Walking Lunges", "sets": "2 x 12-15 each side" }
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Workout Test Walking Lunges"))
				.andExpect(jsonPath("$.sets").value("2 x 12-15 each side"));

		mockMvc.perform(delete("/api/myplan/workout/plan/days/{dayId}/exercises/{itemId}", dayId, itemId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/myplan/workout/plan")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].exercises", hasSize(0)));
	}

	@Test
	void exerciseItemOnAnotherUsersDayIsNotFound() throws Exception {
		String tokenA = registerVerifyAndLogin("workout-item-isolation-a@example.com");
		String tokenB = registerVerifyAndLogin("workout-item-isolation-b@example.com");

		String dayId = addDay(tokenA, null, null);

		mockMvc.perform(post("/api/myplan/workout/plan/days/{dayId}/exercises", dayId)
						.header("Authorization", "Bearer " + tokenB)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "Workout Test Intruder", "sets": "3 x 10" }
								"""))
				.andExpect(status().isNotFound());
	}

	// --- Helpers ---

	private String addDay(String token, String title, String weekday) throws Exception {
		String body;
		if (title == null && weekday == null) {
			body = "{}";
		}
		else if (weekday == null) {
			body = """
					{ "title": "%s" }
					""".formatted(title);
		}
		else {
			body = """
					{ "title": "%s", "weekday": "%s" }
					""".formatted(title, weekday);
		}

		MvcResult result = mockMvc.perform(post("/api/myplan/workout/plan/days")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(body))
				.andExpect(status().isCreated())
				.andReturn();

		return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
	}

	private MvcResult addItem(String dayId, String token, String name, String sets) throws Exception {
		return mockMvc.perform(post("/api/myplan/workout/plan/days/{dayId}/exercises", dayId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{ "name": "%s", "sets": "%s" }
								""".formatted(name, sets)))
				.andExpect(status().isCreated())
				.andReturn();
	}

	private String addItemAndReturnExerciseId(String dayId, String token, String name, String sets)
			throws Exception {
		MvcResult result = addItem(dayId, token, name, sets);
		return JsonPath.read(result.getResponse().getContentAsString(), "$.exerciseId");
	}

	private String addItemAndReturnItemId(String dayId, String token, String name, String sets)
			throws Exception {
		MvcResult result = addItem(dayId, token, name, sets);
		return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
	}

	private String registerVerifyAndLogin(String email) throws Exception {
		registerAndVerify(email);
		return loginActiveMember(email);
	}

	private String registerVerifyAddRoleAndLogin(String email, UserRole role) throws Exception {
		registerAndVerify(email);
		UserAccount user = userAccountRepository.findByEmail(email).orElseThrow();
		user.addRole(role);
		userAccountRepository.saveAndFlush(user);

		return loginActiveMember(email);
	}

	private void registerAndVerify(String email) throws Exception {
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
	}

	private String loginActiveMember(String email) throws Exception {
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
