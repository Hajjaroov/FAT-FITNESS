import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminMacroChecksView } from "@/app/_components/AdminMacroChecksView";
import { renderWithProviders } from "@/test/render";
import { getCurrentUser, getMacroChecks, resolveMacroCheck, testUser } from "@/lib/api";
import type { FoodMacroCheck } from "@/types/diet";

vi.mock("@/lib/api");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/admin/macro-checks",
}));

const openCheck: FoodMacroCheck = {
  id: "c1",
  targetFood: {
    id: "f1",
    name: "Chicken breast",
    nameDe: null,
    unitLabel: "100g",
    caloriesPerUnit: 120,
    proteinPerUnit: 22,
    carbsPerUnit: 0,
    fatPerUnit: 2.6,
  },
  proposedName: null,
  proposedUnitLabel: null,
  proposedCaloriesPerUnit: 110,
  proposedProteinPerUnit: 23,
  proposedCarbsPerUnit: 0,
  proposedFatPerUnit: 2,
  comment: "Values look too high",
  submittedByDisplayName: "Flagging User",
  status: "OPEN",
  createdAt: "2026-07-01T10:00:00Z",
};

afterEach(() => {
  vi.resetAllMocks();
});

describe("AdminMacroChecksView", () => {
  it("blocks non-moderator users without fetching any checks", async () => {
    renderWithProviders(<AdminMacroChecksView />);

    expect(await screen.findByText("No moderation access")).toBeInTheDocument();
    expect(getMacroChecks).not.toHaveBeenCalled();
  });

  it("lists open checks for a moderator", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...testUser, roles: ["MODERATOR"] });
    vi.mocked(getMacroChecks).mockResolvedValue([openCheck]);

    renderWithProviders(<AdminMacroChecksView />);

    expect(await screen.findByText("Chicken breast")).toBeInTheDocument();
    expect(screen.getByText("Values look too high")).toBeInTheDocument();
    expect(getMacroChecks).toHaveBeenCalledWith("OPEN", "test-token");
  });

  it("refetches with the newly selected status filter", async () => {
    const user = userEvent.setup();
    vi.mocked(getCurrentUser).mockResolvedValue({ ...testUser, roles: ["MODERATOR"] });
    vi.mocked(getMacroChecks).mockResolvedValue([]);

    renderWithProviders(<AdminMacroChecksView />);
    await screen.findByText("No macro checks here");

    await user.selectOptions(screen.getByLabelText("Status"), "ALL");

    await waitFor(() => expect(getMacroChecks).toHaveBeenLastCalledWith("ALL", "test-token"));
  });

  it("applies a check and drops it from the OPEN-filtered list", async () => {
    const user = userEvent.setup();
    vi.mocked(getCurrentUser).mockResolvedValue({ ...testUser, roles: ["MODERATOR"] });
    vi.mocked(getMacroChecks).mockResolvedValue([openCheck]);
    vi.mocked(resolveMacroCheck).mockResolvedValue({ ...openCheck, status: "RESOLVED" });

    renderWithProviders(<AdminMacroChecksView />);
    await screen.findByText("Chicken breast");

    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() =>
      expect(resolveMacroCheck).toHaveBeenCalledWith(
        "c1",
        expect.objectContaining({ action: "APPLY", finalCaloriesPerUnit: 110 }),
        "test-token",
      ),
    );
    // The card leaves the list because a RESOLVED check no longer matches the OPEN filter.
    await waitFor(() => expect(screen.queryByText("Chicken breast")).not.toBeInTheDocument());
  });
});
