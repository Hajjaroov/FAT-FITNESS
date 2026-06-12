import { apiBaseUrl } from "@/lib/config";
import type {
  CurrentUser,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  TokenResponse,
  VerifyEmailResponse,
} from "@/types/auth";
import type { BackendStatus } from "@/types/api";
import type {
  CreateForumCommentRequest,
  CreateForumPostRequest,
  ForumComment,
  ForumCommentReport,
  ForumPost,
  ForumPostReport,
  ReportForumCommentRequest,
  ReportForumPostRequest,
} from "@/types/community";

type ApiRequestOptions = {
  method?: "GET" | "POST";
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

async function apiRequest<T>(
  path: string,
  {
    method = "GET",
    body,
    accessToken,
    credentials = "same-origin",
  }: ApiRequestOptions = {},
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
  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(payload, `API request failed with status ${response.status}`),
      response.status,
      payload,
    );
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

export function getForumPost(postId: string) {
  return apiRequest<ForumPost>(`/api/community/posts/${postId}`);
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

export function getForumComments({
  postId,
  limit,
}: {
  postId: string;
  limit?: number;
}) {
  const params = new URLSearchParams();

  if (limit) {
    params.set("limit", String(limit));
  }

  const query = params.toString();

  return apiRequest<ForumComment[]>(
    `/api/community/posts/${postId}/comments${query ? `?${query}` : ""}`,
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
