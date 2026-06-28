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
    logger.error("api.request_failed", { path, status: response.status, message });
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

export function getPublicUserProfile(userId: string) {
  return apiRequest<UserPublicProfile>(`/api/users/${userId}/profile`);
}

export async function uploadAvatar(blob: Blob, accessToken: string): Promise<void> {
  const formData = new FormData();
  formData.append("avatar", blob, "avatar.jpg");
  const response = await fetch(`${apiBaseUrl}/api/users/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(
      getApiErrorMessage(payload, `Avatar upload failed with status ${response.status}`),
      response.status,
      payload,
    );
  }
}
