import { apiBaseUrl } from "@/lib/config";
import { logger } from "@/lib/logger";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  CurrentUser,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RevokeAllSessionsResponse,
  TokenResponse,
  UpdateNotificationPreferencesRequest,
  UpdateNotificationPreferencesResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  VerifyEmailResponse,
} from "@/types/auth";
import type { BackendStatus } from "@/types/api";
import type {
  BookmarkToggleResponse,
  CreateForumCommentRequest,
  CreateForumPostRequest,
  ForumComment,
  ForumCommentReport,
  ForumPost,
  ForumPostReport,
  LikeToggleResponse,
  ReportForumCommentRequest,
  ReportForumPostRequest,
  UpdateForumCommentRequest,
  UpdateForumPostRequest,
} from "@/types/community";
import type {
  HideModerationReportRequest,
  ModerationReport,
  ModerationReportStatusFilter,
  ModerationReportTargetType,
  ResolveModerationReportRequest,
} from "@/types/moderation";
import type { UserPublicProfile } from "@/types/user";
import type {
  BroadcastMessageRequest,
  BroadcastMessageResponse,
  ConversationSummary,
  ConversationThread,
  MessageItem,
  ReplyMessageRequest,
  StartConversationRequest,
  UnreadCount,
} from "@/types/messaging";
import type { WeightEntry, WeightGoal } from "@/types/myplan";
import type {
  DietMeal,
  DietMealItem,
  Food,
  FoodMacroCheck,
  FoodMacroCheckStatus,
} from "@/types/diet";
import type { Exercise, Weekday, WorkoutPlanDay, WorkoutPlanDayExercise } from "@/types/workout";
import type { MedicationLogEntry } from "@/types/glp1";
import type { SubscribePushRequest } from "@/types/push";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string;
  credentials?: RequestCredentials;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return null;
  }

  return response.json() as Promise<unknown>;
}

function getApiErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const problem = payload as { detail?: unknown; message?: unknown; title?: unknown };

    if (typeof problem.detail === "string") {
      return problem.detail;
    }

    if (typeof problem.message === "string") {
      return problem.message;
    }

    if (typeof problem.title === "string") {
      return problem.title;
    }
  }

  return fallback;
}

/**
 * Bridge to the React auth state so background token refresh (triggered by a 401)
 * can update the in-memory access token and reflect sign-out in the UI. The
 * AuthProvider registers this on mount; api.ts stays framework-agnostic otherwise.
 */
type AuthBridge = {
  onAccessToken: (accessToken: string) => void;
  onSignedOut: () => void;
};

let authBridge: AuthBridge | null = null;

export function registerAuthBridge(bridge: AuthBridge): () => void {
  authBridge = bridge;
  return () => {
    if (authBridge === bridge) {
      authBridge = null;
    }
  };
}

// De-duplicate concurrent refreshes so a burst of 401s triggers a single refresh call.
let inFlightRefresh: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!inFlightRefresh) {
    inFlightRefresh = refreshAuthSession()
      .then((response) => {
        authBridge?.onAccessToken(response.accessToken);
        return response.accessToken;
      })
      .catch(() => {
        authBridge?.onSignedOut();
        return null;
      })
      .finally(() => {
        inFlightRefresh = null;
      });
  }

  return inFlightRefresh;
}

async function apiRequest<T>(
  path: string,
  {
    method = "GET",
    body,
    accessToken,
    credentials = "same-origin",
  }: ApiRequestOptions = {},
  allowRefreshRetry = true,
): Promise<T> {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    credentials,
  });

  // An authenticated request whose short-lived access token expired: refresh once
  // via the HttpOnly cookie and retry transparently before surfacing the error.
  if (response.status === 401 && allowRefreshRetry && accessToken) {
    const nextAccessToken = await refreshAccessToken();
    if (nextAccessToken) {
      return apiRequest<T>(
        path,
        { method, body, accessToken: nextAccessToken, credentials },
        false,
      );
    }
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const message = getApiErrorMessage(payload, `API request failed with status ${response.status}`);
    // A 401 from refresh just means there is no valid session (e.g. an anonymous
    // visitor's page load) — expected, not a real failure worth logging as an error.
    const isExpectedRefreshRejection = path === "/api/auth/refresh" && response.status === 401;
    if (!isExpectedRefreshRejection) {
      logger.error("api.request_failed", { path, status: response.status, message });
    }
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export function getBackendStatus() {
  return apiRequest<BackendStatus>("/api/status");
}

export function registerUser(request: RegisterRequest) {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: request,
  });
}

export function verifyEmail(token: string) {
  return apiRequest<VerifyEmailResponse>("/api/auth/verify-email", {
    method: "POST",
    body: { token },
  });
}

export function loginUser(request: LoginRequest) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: request,
    credentials: "include",
  });
}

export function refreshAuthSession() {
  return apiRequest<TokenResponse>("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
}

export function logoutUser() {
  return apiRequest<LogoutResponse>("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export function getCurrentUser(accessToken: string) {
  return apiRequest<CurrentUser>("/api/auth/me", {
    accessToken,
  });
}

export function getForumPosts({
  categorySlug,
  limit,
}: {
  categorySlug?: string;
  limit?: number;
} = {}) {
  const params = new URLSearchParams();

  if (categorySlug) {
    params.set("categorySlug", categorySlug);
  }

  if (limit) {
    params.set("limit", String(limit));
  }

  const query = params.toString();

  return apiRequest<ForumPost[]>(
    `/api/community/posts${query ? `?${query}` : ""}`,
  );
}

export function getForumPost(postId: string, accessToken?: string) {
  return apiRequest<ForumPost>(`/api/community/posts/${postId}`, { accessToken });
}

export function createForumPost(
  request: CreateForumPostRequest,
  accessToken: string,
) {
  return apiRequest<ForumPost>("/api/community/posts", {
    method: "POST",
    body: request,
    accessToken,
  });
}

export function updateForumPost(
  postId: string,
  request: UpdateForumPostRequest,
  accessToken: string,
) {
  return apiRequest<ForumPost>(`/api/community/posts/${postId}`, {
    method: "PATCH",
    body: request,
    accessToken,
  });
}

export function deleteForumPost(postId: string, accessToken: string) {
  return apiRequest<void>(`/api/community/posts/${postId}`, {
    method: "DELETE",
    accessToken,
  });
}

export function reportForumPost(
  postId: string,
  request: ReportForumPostRequest,
  accessToken: string,
) {
  return apiRequest<ForumPostReport>(`/api/community/posts/${postId}/reports`, {
    method: "POST",
    body: request,
    accessToken,
  });
}

export function getForumComments(
  {
    postId,
    limit,
  }: {
    postId: string;
    limit?: number;
  },
  accessToken?: string,
) {
  const params = new URLSearchParams();

  if (limit) {
    params.set("limit", String(limit));
  }

  const query = params.toString();

  return apiRequest<ForumComment[]>(
    `/api/community/posts/${postId}/comments${query ? `?${query}` : ""}`,
    { accessToken },
  );
}

export function createForumComment(
  postId: string,
  request: CreateForumCommentRequest,
  accessToken: string,
) {
  return apiRequest<ForumComment>(`/api/community/posts/${postId}/comments`, {
    method: "POST",
    body: request,
    accessToken,
  });
}

export function updateForumComment(
  commentId: string,
  request: UpdateForumCommentRequest,
  accessToken: string,
) {
  return apiRequest<ForumComment>(`/api/community/comments/${commentId}`, {
    method: "PATCH",
    body: request,
    accessToken,
  });
}

export function deleteForumComment(commentId: string, accessToken: string) {
  return apiRequest<void>(`/api/community/comments/${commentId}`, {
    method: "DELETE",
    accessToken,
  });
}

export function reportForumComment(
  commentId: string,
  request: ReportForumCommentRequest,
  accessToken: string,
) {
  return apiRequest<ForumCommentReport>(
    `/api/community/comments/${commentId}/reports`,
    {
      method: "POST",
      body: request,
      accessToken,
    },
  );
}

export function getModerationReports(
  {
    status,
    targetType,
    limit,
  }: {
    status?: ModerationReportStatusFilter;
    targetType?: ModerationReportTargetType | "ALL";
    limit?: number;
  },
  accessToken: string,
) {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (targetType && targetType !== "ALL") {
    params.set("targetType", targetType);
  }

  if (limit) {
    params.set("limit", String(limit));
  }

  const query = params.toString();

  return apiRequest<ModerationReport[]>(
    `/api/moderation/reports${query ? `?${query}` : ""}`,
    {
      accessToken,
    },
  );
}

export function resolveModerationPostReport(
  reportId: string,
  request: ResolveModerationReportRequest,
  accessToken: string,
) {
  return apiRequest<ModerationReport>(
    `/api/moderation/reports/posts/${reportId}/resolve`,
    {
      method: "POST",
      body: request,
      accessToken,
    },
  );
}

export function resolveModerationCommentReport(
  reportId: string,
  request: ResolveModerationReportRequest,
  accessToken: string,
) {
  return apiRequest<ModerationReport>(
    `/api/moderation/reports/comments/${reportId}/resolve`,
    {
      method: "POST",
      body: request,
      accessToken,
    },
  );
}

export function hideModerationPostReport(
  reportId: string,
  request: HideModerationReportRequest,
  accessToken: string,
) {
  return apiRequest<ModerationReport>(
    `/api/moderation/reports/posts/${reportId}/hide`,
    {
      method: "POST",
      body: request,
      accessToken,
    },
  );
}

export function hideModerationCommentReport(
  reportId: string,
  request: HideModerationReportRequest,
  accessToken: string,
) {
  return apiRequest<ModerationReport>(
    `/api/moderation/reports/comments/${reportId}/hide`,
    {
      method: "POST",
      body: request,
      accessToken,
    },
  );
}

export function lockModerationPost(postId: string, accessToken: string) {
  return apiRequest<void>(`/api/moderation/posts/${postId}/lock`, {
    method: "POST",
    accessToken,
  });
}

export function banUser(userId: string, accessToken: string) {
  return apiRequest<void>(`/api/moderation/users/${userId}/ban`, {
    method: "POST",
    accessToken,
  });
}

export function likeForumPost(postId: string, accessToken: string) {
  return apiRequest<LikeToggleResponse>(`/api/community/posts/${postId}/like`, {
    method: "POST",
    accessToken,
  });
}

export function likeForumComment(commentId: string, accessToken: string) {
  return apiRequest<LikeToggleResponse>(
    `/api/community/comments/${commentId}/like`,
    {
      method: "POST",
      accessToken,
    },
  );
}

export function bookmarkForumPost(postId: string, accessToken: string) {
  return apiRequest<BookmarkToggleResponse>(
    `/api/community/posts/${postId}/bookmark`,
    {
      method: "POST",
      accessToken,
    },
  );
}

export function getBookmarkedPosts(accessToken: string) {
  return apiRequest<ForumPost[]>("/api/community/bookmarks", { accessToken });
}

export function forgotPassword(request: ForgotPasswordRequest) {
  return apiRequest<ForgotPasswordResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: request,
  });
}

export function resetPassword(request: ResetPasswordRequest) {
  return apiRequest<ResetPasswordResponse>("/api/auth/reset-password", {
    method: "POST",
    body: request,
  });
}

export function updateProfile(request: UpdateProfileRequest, accessToken: string) {
  return apiRequest<UpdateProfileResponse>("/api/users/me/profile", {
    method: "PATCH",
    body: request,
    accessToken,
  });
}

export function changePassword(request: ChangePasswordRequest, accessToken: string) {
  return apiRequest<ChangePasswordResponse>("/api/users/me/change-password", {
    method: "POST",
    body: request,
    accessToken,
  });
}

export function revokeAllSessions(accessToken: string) {
  return apiRequest<RevokeAllSessionsResponse>("/api/users/me/sessions/revoke-all", {
    method: "POST",
    accessToken,
  });
}

export function updateNotificationPreferences(
  request: UpdateNotificationPreferencesRequest,
  accessToken: string,
) {
  return apiRequest<UpdateNotificationPreferencesResponse>("/api/users/me/notifications", {
    method: "PATCH",
    body: request,
    accessToken,
  });
}

export function getPublicUserProfile(userId: string) {
  return apiRequest<UserPublicProfile>(`/api/users/${userId}/profile`);
}

export function getConversations(accessToken: string) {
  return apiRequest<ConversationSummary[]>("/api/messages", { accessToken });
}

export function getUnreadMessageCount(accessToken: string) {
  return apiRequest<UnreadCount>("/api/messages/unread-count", { accessToken });
}

export function getConversation(conversationId: string, accessToken: string) {
  return apiRequest<ConversationThread>(`/api/messages/${conversationId}`, {
    accessToken,
  });
}

export function startConversation(
  request: StartConversationRequest,
  accessToken: string,
) {
  return apiRequest<ConversationThread>("/api/messages", {
    method: "POST",
    body: request,
    accessToken,
  });
}

export function replyToConversation(
  conversationId: string,
  request: ReplyMessageRequest,
  accessToken: string,
) {
  return apiRequest<MessageItem>(`/api/messages/${conversationId}/reply`, {
    method: "POST",
    body: request,
    accessToken,
  });
}

export function deleteConversation(conversationId: string, accessToken: string) {
  return apiRequest<void>(`/api/messages/${conversationId}`, {
    method: "DELETE",
    accessToken,
  });
}

export function subscribeToPush(request: SubscribePushRequest, accessToken: string) {
  return apiRequest<void>("/api/push/subscriptions", {
    method: "POST",
    body: request,
    accessToken,
  });
}

export function unsubscribeFromPush(endpoint: string, accessToken: string) {
  return apiRequest<void>("/api/push/subscriptions", {
    method: "DELETE",
    body: { endpoint },
    accessToken,
  });
}

export function broadcastMessage(
  request: BroadcastMessageRequest,
  accessToken: string,
) {
  return apiRequest<BroadcastMessageResponse>("/api/messages/broadcast", {
    method: "POST",
    body: request,
    accessToken,
  });
}

async function uploadAvatarOnce(
  blob: Blob,
  accessToken: string,
  allowRefreshRetry: boolean,
): Promise<void> {
  const formData = new FormData();
  formData.append("avatar", blob, "avatar.jpg");
  const response = await fetch(`${apiBaseUrl}/api/users/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  if (response.status === 401 && allowRefreshRetry) {
    const nextAccessToken = await refreshAccessToken();
    if (nextAccessToken) {
      return uploadAvatarOnce(blob, nextAccessToken, false);
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(
      getApiErrorMessage(payload, `Avatar upload failed with status ${response.status}`),
      response.status,
      payload,
    );
  }
}

export function uploadAvatar(blob: Blob, accessToken: string): Promise<void> {
  return uploadAvatarOnce(blob, accessToken, true);
}

export function getWeightGoals(accessToken: string) {
  return apiRequest<WeightGoal>("/api/myplan/weight/goals", { accessToken });
}

export function updateWeightGoals(
  startWeight: number,
  goalWeight: number,
  accessToken: string,
) {
  return apiRequest<WeightGoal>("/api/myplan/weight/goals", {
    method: "PATCH",
    body: { startWeight, goalWeight },
    accessToken,
  });
}

export function getWeightEntries(accessToken: string) {
  return apiRequest<WeightEntry[]>("/api/myplan/weight/entries", { accessToken });
}

export function addWeightEntry(
  entryDate: string,
  weightKg: number,
  accessToken: string,
) {
  return apiRequest<WeightEntry>("/api/myplan/weight/entries", {
    method: "POST",
    body: { entryDate, weightKg },
    accessToken,
  });
}

export type MedicationLogEntryInput = {
  entryDate: string;
  doseMg: number;
  notes?: string;
};

export function getMedicationLogEntries(accessToken: string) {
  return apiRequest<MedicationLogEntry[]>("/api/myplan/glp1/entries", { accessToken });
}

export function addMedicationLogEntry(
  input: MedicationLogEntryInput,
  accessToken: string,
) {
  return apiRequest<MedicationLogEntry>("/api/myplan/glp1/entries", {
    method: "POST",
    body: input,
    accessToken,
  });
}

export function updateMedicationLogEntry(
  entryId: string,
  input: MedicationLogEntryInput,
  accessToken: string,
) {
  return apiRequest<MedicationLogEntry>(`/api/myplan/glp1/entries/${entryId}`, {
    method: "PATCH",
    body: input,
    accessToken,
  });
}

export function deleteMedicationLogEntry(entryId: string, accessToken: string) {
  return apiRequest<void>(`/api/myplan/glp1/entries/${entryId}`, {
    method: "DELETE",
    accessToken,
  });
}

export type FoodMacrosInput = {
  name: string;
  nameDe?: string;
  unitLabel: string;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  carbsPerUnit: number;
  fatPerUnit: number;
};

export type DietMealItemInput = {
  foodId?: string;
  name: string;
  nameDe?: string;
  unitLabel?: string;
  quantity: number;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  carbsPerUnit: number;
  fatPerUnit: number;
};

export function getFoods(accessToken: string) {
  return apiRequest<Food[]>("/api/myplan/diet/foods", { accessToken });
}

export function updateFood(
  foodId: string,
  input: FoodMacrosInput,
  accessToken: string,
) {
  return apiRequest<Food>(`/api/myplan/diet/foods/${foodId}`, {
    method: "PATCH",
    body: input,
    accessToken,
  });
}

export function deleteFood(foodId: string, accessToken: string) {
  return apiRequest<void>(`/api/myplan/diet/foods/${foodId}`, {
    method: "DELETE",
    accessToken,
  });
}

export function getDietMeals(accessToken: string) {
  return apiRequest<DietMeal[]>("/api/myplan/diet/meals", { accessToken });
}

export function addDietMeal(title: string | undefined, accessToken: string) {
  return apiRequest<DietMeal>("/api/myplan/diet/meals", {
    method: "POST",
    body: { title },
    accessToken,
  });
}

export function updateDietMeal(
  mealId: string,
  title: string,
  accessToken: string,
) {
  return apiRequest<DietMeal>(`/api/myplan/diet/meals/${mealId}`, {
    method: "PATCH",
    body: { title },
    accessToken,
  });
}

export function deleteDietMeal(mealId: string, accessToken: string) {
  return apiRequest<void>(`/api/myplan/diet/meals/${mealId}`, {
    method: "DELETE",
    accessToken,
  });
}

export function reorderDietMeals(
  orderedMealIds: string[],
  accessToken: string,
) {
  return apiRequest<DietMeal[]>("/api/myplan/diet/meals/reorder", {
    method: "PATCH",
    body: { orderedMealIds },
    accessToken,
  });
}

export function addDietMealItem(
  mealId: string,
  input: DietMealItemInput,
  accessToken: string,
) {
  return apiRequest<DietMealItem>(`/api/myplan/diet/meals/${mealId}/items`, {
    method: "POST",
    body: input,
    accessToken,
  });
}

export function updateDietMealItem(
  mealId: string,
  itemId: string,
  input: Omit<DietMealItemInput, "foodId">,
  accessToken: string,
) {
  return apiRequest<DietMealItem>(
    `/api/myplan/diet/meals/${mealId}/items/${itemId}`,
    {
      method: "PATCH",
      body: input,
      accessToken,
    },
  );
}

export function deleteDietMealItem(
  mealId: string,
  itemId: string,
  accessToken: string,
) {
  return apiRequest<void>(`/api/myplan/diet/meals/${mealId}/items/${itemId}`, {
    method: "DELETE",
    accessToken,
  });
}

export type WorkoutPlanDayInput = {
  title?: string;
  weekday?: Weekday;
};

export type WorkoutPlanDayExerciseInput = {
  exerciseId?: string;
  name: string;
  nameDe?: string;
  sets: string;
};

export function getExercises(accessToken: string) {
  return apiRequest<Exercise[]>("/api/myplan/workout/exercises", { accessToken });
}

export function getWorkoutPlan(accessToken: string) {
  return apiRequest<WorkoutPlanDay[]>("/api/myplan/workout/plan", { accessToken });
}

export function addWorkoutPlanDay(input: WorkoutPlanDayInput, accessToken: string) {
  return apiRequest<WorkoutPlanDay>("/api/myplan/workout/plan/days", {
    method: "POST",
    body: input,
    accessToken,
  });
}

export function updateWorkoutPlanDay(
  dayId: string,
  input: { title: string; weekday?: Weekday },
  accessToken: string,
) {
  return apiRequest<WorkoutPlanDay>(`/api/myplan/workout/plan/days/${dayId}`, {
    method: "PATCH",
    body: input,
    accessToken,
  });
}

export function deleteWorkoutPlanDay(dayId: string, accessToken: string) {
  return apiRequest<void>(`/api/myplan/workout/plan/days/${dayId}`, {
    method: "DELETE",
    accessToken,
  });
}

export function reorderWorkoutPlanDays(
  orderedDayIds: string[],
  accessToken: string,
) {
  return apiRequest<WorkoutPlanDay[]>("/api/myplan/workout/plan/days/reorder", {
    method: "PATCH",
    body: { orderedDayIds },
    accessToken,
  });
}

export function addWorkoutPlanDayExercise(
  dayId: string,
  input: WorkoutPlanDayExerciseInput,
  accessToken: string,
) {
  return apiRequest<WorkoutPlanDayExercise>(
    `/api/myplan/workout/plan/days/${dayId}/exercises`,
    {
      method: "POST",
      body: input,
      accessToken,
    },
  );
}

export function updateWorkoutPlanDayExercise(
  dayId: string,
  itemId: string,
  input: Omit<WorkoutPlanDayExerciseInput, "exerciseId" | "nameDe">,
  accessToken: string,
) {
  return apiRequest<WorkoutPlanDayExercise>(
    `/api/myplan/workout/plan/days/${dayId}/exercises/${itemId}`,
    {
      method: "PATCH",
      body: input,
      accessToken,
    },
  );
}

export function deleteWorkoutPlanDayExercise(
  dayId: string,
  itemId: string,
  accessToken: string,
) {
  return apiRequest<void>(
    `/api/myplan/workout/plan/days/${dayId}/exercises/${itemId}`,
    {
      method: "DELETE",
      accessToken,
    },
  );
}

export type SubmitMacroCheckInput = {
  targetFoodId: string;
  proposedName?: string;
  proposedUnitLabel?: string;
  proposedCaloriesPerUnit: number;
  proposedProteinPerUnit: number;
  proposedCarbsPerUnit: number;
  proposedFatPerUnit: number;
  comment?: string;
};

export function submitMacroCheck(
  input: SubmitMacroCheckInput,
  accessToken: string,
) {
  return apiRequest<FoodMacroCheck>("/api/myplan/diet/macro-checks", {
    method: "POST",
    body: input,
    accessToken,
  });
}

export function getMacroChecks(
  status: FoodMacroCheckStatus | "ALL" | undefined,
  accessToken: string,
) {
  const params = new URLSearchParams();
  if (status) {
    params.set("status", status);
  }
  const query = params.toString();

  return apiRequest<FoodMacroCheck[]>(
    `/api/myplan/diet/macro-checks${query ? `?${query}` : ""}`,
    { accessToken },
  );
}

export type ResolveMacroCheckInput = {
  action: "APPLY" | "DISMISS";
  finalName?: string;
  finalNameDe?: string;
  finalUnitLabel?: string;
  finalCaloriesPerUnit?: number;
  finalProteinPerUnit?: number;
  finalCarbsPerUnit?: number;
  finalFatPerUnit?: number;
  resolutionNote?: string;
};

export function resolveMacroCheck(
  checkId: string,
  input: ResolveMacroCheckInput,
  accessToken: string,
) {
  return apiRequest<FoodMacroCheck>(
    `/api/myplan/diet/macro-checks/${checkId}/resolve`,
    {
      method: "POST",
      body: input,
      accessToken,
    },
  );
}
