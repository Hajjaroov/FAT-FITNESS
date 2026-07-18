// Manual Vitest mock for @/lib/api, picked up by vi.mock("@/lib/api") in test
// files. Every network function is a vi.fn(); tests set the resolutions they
// need. Auth defaults simulate a signed-in user so provider-wrapped views work
// out of the box — override refreshAuthSession to reject for anonymous tests.
import { vi } from "vitest";
import type { CurrentUser } from "@/types/auth";

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

export const testUser: CurrentUser = {
  userId: "00000000-0000-0000-0000-000000000001",
  email: "test-user@example.com",
  displayName: "Test User",
  countryRegionCode: "DE",
  status: "ACTIVE",
  roles: ["USER"],
  emailVerifiedAt: "2026-01-01T00:00:00Z",
  lastLoginAt: null,
  hasAvatar: false,
  emailNotificationsPm: true,
};

export const registerAuthBridge = vi.fn(() => () => {});
export const refreshAuthSession = vi.fn(async () => ({ accessToken: "test-token" }));
export const getCurrentUser = vi.fn(async () => testUser);
export const loginUser = vi.fn();
export const logoutUser = vi.fn(async () => ({}));
export const getUnreadMessageCount = vi.fn(async () => ({ unreadCount: 0 }));

export const getDietMeals = vi.fn(async () => []);
export const getFoods = vi.fn(async () => []);
export const addDietMeal = vi.fn();
export const updateDietMeal = vi.fn();
export const deleteDietMeal = vi.fn();
export const reorderDietMeals = vi.fn();
export const addDietMealItem = vi.fn();
export const updateDietMealItem = vi.fn();
export const deleteDietMealItem = vi.fn();
export const updateFood = vi.fn();
export const deleteFood = vi.fn();
export const submitMacroCheck = vi.fn();
export const getMacroChecks = vi.fn(async () => []);
export const resolveMacroCheck = vi.fn();
