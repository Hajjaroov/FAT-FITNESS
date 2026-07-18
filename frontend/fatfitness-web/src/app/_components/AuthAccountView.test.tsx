import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthAccountView } from "@/app/_components/AuthAccountView";
import { renderWithProviders } from "@/test/render";
import { ApiError, loginUser, refreshAuthSession, registerUser } from "@/lib/api";
// Fixtures come from the manual mock directly: TS resolves "@/lib/api" to the
// real module, which doesn't export them; at runtime both paths are the same
// vi.mock'd module instance.
import { testTokens, testUser } from "@/lib/__mocks__/api";

vi.mock("@/lib/api");

const routerPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: routerPush, back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/login",
}));

afterEach(() => {
  vi.resetAllMocks();
});

describe("AuthAccountView login", () => {
  it("logs in and redirects to /community", async () => {
    const user = userEvent.setup();
    // Anonymous visitor: the mount-time session restore fails, the form submits.
    vi.mocked(refreshAuthSession).mockRejectedValue(new Error("no session"));
    vi.mocked(loginUser).mockResolvedValue({
      ...testTokens,
      accessToken: "fresh-token",
      userId: testUser.userId,
      email: testUser.email,
      displayName: testUser.displayName,
      roles: testUser.roles,
    });

    renderWithProviders(<AuthAccountView mode="login" />);

    await user.type(await screen.findByLabelText("Email"), "owner@example.com");
    await user.type(screen.getByLabelText("Password"), "very-secret-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/community"));
    expect(loginUser).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "very-secret-password",
      clientType: "WEB",
      deviceLabel: "Web browser",
    });
  });

  it("shows the backend error message when login fails", async () => {
    const user = userEvent.setup();
    vi.mocked(refreshAuthSession).mockRejectedValue(new Error("no session"));
    vi.mocked(loginUser).mockRejectedValue(
      new ApiError("Invalid email or password", 401, null),
    );

    renderWithProviders(<AuthAccountView mode="login" />);

    await user.type(await screen.findByLabelText("Email"), "owner@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(routerPush).not.toHaveBeenCalled();
  });

  it("shows the signed-in panel instead of the form when a session exists", async () => {
    vi.mocked(refreshAuthSession).mockResolvedValue(testTokens);

    renderWithProviders(<AuthAccountView mode="login" />);

    // The display name renders in the signed-in panel and the header auth pill.
    expect(await screen.findAllByText(testUser.displayName)).not.toHaveLength(0);
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });
});

describe("AuthAccountView register validation", () => {
  async function fillBaseRegisterFields(user: ReturnType<typeof userEvent.setup>) {
    await user.type(await screen.findByLabelText("Display name"), "New Member");
    await user.type(screen.getByLabelText("Email"), "new-member@example.com");
    await user.type(screen.getByLabelText("Password"), "very-secret-password");
  }

  it("requires a country selection before anything is sent", async () => {
    const user = userEvent.setup();
    vi.mocked(refreshAuthSession).mockRejectedValue(new Error("no session"));

    renderWithProviders(<AuthAccountView mode="register" />);

    await fillBaseRegisterFields(user);
    await user.type(screen.getByLabelText("Confirm password"), "very-secret-password");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Choose a country or region from the list, or choose Other.",
    );
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords client-side", async () => {
    const user = userEvent.setup();
    vi.mocked(refreshAuthSession).mockRejectedValue(new Error("no session"));

    renderWithProviders(<AuthAccountView mode="register" />);

    await fillBaseRegisterFields(user);
    await user.type(screen.getByLabelText("Confirm password"), "a-different-password");

    // Pick a real country through the combobox so the earlier country check passes.
    const countryInput = screen.getByLabelText("Country / region");
    await user.type(countryInput, "germ");
    await user.click(await screen.findByRole("option", { name: "Germany" }));

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Password and confirmation do not match.",
    );
    expect(registerUser).not.toHaveBeenCalled();
  });
});
