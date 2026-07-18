import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, getCurrentUser, getForumPosts, registerAuthBridge } from "@/lib/api";

// These tests exercise the REAL api module (no vi.mock) against a stubbed
// global fetch, covering the 401 → refresh → retry pipeline that every
// component test mocks away.

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

type StubResponse = {
  status: number;
  body?: unknown;
};

function toFetchResponse({ status, body }: StubResponse) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: new Headers(
      body === undefined ? {} : { "content-type": "application/json" },
    ),
    json: async () => body,
  } as Response;
}

type RecordedCall = { url: string; authorization: string | null };

function stubFetch(handler: (url: string, init: RequestInit | undefined, call: number) => StubResponse) {
  const calls: RecordedCall[] = [];
  let count = 0;
  const mock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    calls.push({ url, authorization: headers.get("Authorization") });
    count += 1;
    return toFetchResponse(handler(url, init, count));
  });
  vi.stubGlobal("fetch", mock);
  return { calls, mock };
}

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest 401 handling", () => {
  it("refreshes once and retries the original request with the new token", async () => {
    const { calls } = stubFetch((url) => {
      if (url.endsWith("/api/auth/refresh")) {
        return { status: 200, body: { accessToken: "fresh-token" } };
      }
      const wasRetried = calls.some((c) => c.authorization === "Bearer fresh-token");
      return wasRetried
        ? { status: 200, body: { userId: "u1" } }
        : { status: 401, body: { detail: "expired" } };
    });

    const bridgeToken = vi.fn();
    const unregister = registerAuthBridge({ onAccessToken: bridgeToken, onSignedOut: vi.fn() });

    const result = await getCurrentUser("stale-token");

    expect(result).toEqual({ userId: "u1" });
    expect(calls.filter((c) => c.url.endsWith("/api/auth/refresh"))).toHaveLength(1);
    expect(calls.at(-1)?.authorization).toBe("Bearer fresh-token");
    expect(bridgeToken).toHaveBeenCalledWith("fresh-token");
    unregister();
  });

  it("de-duplicates concurrent refreshes into a single refresh call", async () => {
    let refreshCount = 0;
    stubFetch((url, init) => {
      if (url.endsWith("/api/auth/refresh")) {
        refreshCount += 1;
        return { status: 200, body: { accessToken: "fresh-token" } };
      }
      const headers = new Headers(init?.headers);
      return headers.get("Authorization") === "Bearer fresh-token"
        ? { status: 200, body: { userId: "u1" } }
        : { status: 401, body: { detail: "expired" } };
    });

    const unregister = registerAuthBridge({ onAccessToken: vi.fn(), onSignedOut: vi.fn() });

    await Promise.all([getCurrentUser("stale-token"), getCurrentUser("stale-token")]);

    expect(refreshCount).toBe(1);
    unregister();
  });

  it("signs the user out when the refresh itself is rejected", async () => {
    stubFetch((url) => {
      if (url.endsWith("/api/auth/refresh")) {
        return { status: 401, body: { detail: "no session" } };
      }
      return { status: 401, body: { detail: "expired" } };
    });

    const onSignedOut = vi.fn();
    const unregister = registerAuthBridge({ onAccessToken: vi.fn(), onSignedOut });

    await expect(getCurrentUser("stale-token")).rejects.toBeInstanceOf(ApiError);
    expect(onSignedOut).toHaveBeenCalled();
    unregister();
  });

  it("never attempts a refresh for unauthenticated requests", async () => {
    const { calls } = stubFetch(() => ({ status: 401, body: { detail: "nope" } }));

    await expect(getForumPosts()).rejects.toMatchObject({ status: 401 });
    expect(calls.some((c) => c.url.endsWith("/api/auth/refresh"))).toBe(false);
  });

  it("surfaces the backend problem detail as the ApiError message", async () => {
    stubFetch(() => ({ status: 409, body: { detail: "Email is already registered" } }));

    await expect(getForumPosts()).rejects.toMatchObject({
      status: 409,
      message: "Email is already registered",
    });
  });
});
