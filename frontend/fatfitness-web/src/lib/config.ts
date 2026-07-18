const fallbackApiBaseUrl = "http://localhost:8080";

export const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL || fallbackApiBaseUrl
).replace(/\/$/, "");

export const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
