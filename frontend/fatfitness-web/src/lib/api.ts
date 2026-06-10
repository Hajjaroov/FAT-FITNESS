import { apiBaseUrl } from "@/lib/config";
import type { BackendStatus } from "@/types/api";

async function apiRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getBackendStatus() {
  return apiRequest<BackendStatus>("/api/status");
}
