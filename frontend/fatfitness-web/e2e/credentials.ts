// Dedicated e2e account, seeded by global-setup into the local dev DB.
// All of its data (GLP-1 entries, weight entries) is private to this user.
export const e2eUser = {
  email: "e2e-test@example.com",
  password: "e2e-very-secret-password",
  displayName: "E2E Tester",
};

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
