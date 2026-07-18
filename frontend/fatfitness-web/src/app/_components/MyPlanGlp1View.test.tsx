import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyPlanGlp1View } from "@/app/_components/MyPlanGlp1View";
import { renderWithProviders } from "@/test/render";
import {
  addMedicationLogEntry,
  addWeightEntry,
  ApiError,
  getMedicationLogEntries,
} from "@/lib/api";
import type { MedicationLogEntry } from "@/types/glp1";

vi.mock("@/lib/api");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/myplan/glp1",
}));

const savedEntry: MedicationLogEntry = {
  id: "e1",
  entryDate: "2026-07-18",
  doseMg: 10,
  notes: null,
  updatedAt: "2026-07-18T08:00:00Z",
};

async function openFormAndFillDose(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: "Add entry" }));
  await user.type(screen.getByLabelText("Dose (mg)"), "10");
}

afterEach(() => {
  vi.resetAllMocks();
});

describe("MyPlanGlp1View", () => {
  it("logs a dose without touching the weight endpoint when no weight is typed", async () => {
    const user = userEvent.setup();
    vi.mocked(addMedicationLogEntry).mockResolvedValue(savedEntry);

    renderWithProviders(<MyPlanGlp1View />);

    await openFormAndFillDose(user);
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    await waitFor(() =>
      expect(addMedicationLogEntry).toHaveBeenCalledWith(
        expect.objectContaining({ doseMg: 10, notes: undefined }),
        "test-token",
      ),
    );
    expect(addWeightEntry).not.toHaveBeenCalled();
  });

  it("also logs an optional weight through the shared weight endpoint", async () => {
    const user = userEvent.setup();
    vi.mocked(addMedicationLogEntry).mockResolvedValue(savedEntry);
    vi.mocked(addWeightEntry).mockResolvedValue({
      id: "w1",
      entryDate: savedEntry.entryDate,
      weightKg: 154.5,
      createdAt: "2026-07-18T08:00:00Z",
    });

    renderWithProviders(<MyPlanGlp1View />);

    await openFormAndFillDose(user);
    await user.type(screen.getByLabelText("Weight (kg, optional)"), "154.5");
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    await waitFor(() =>
      expect(addWeightEntry).toHaveBeenCalledWith(savedEntry.entryDate, 154.5, "test-token"),
    );
  });

  it("silently keeps the dose when the weight write is rejected (already logged that day)", async () => {
    const user = userEvent.setup();
    vi.mocked(addMedicationLogEntry).mockResolvedValue(savedEntry);
    vi.mocked(addWeightEntry).mockRejectedValue(
      new ApiError("Weight already logged for this date", 409, null),
    );

    renderWithProviders(<MyPlanGlp1View />);

    await openFormAndFillDose(user);
    await user.type(screen.getByLabelText("Weight (kg, optional)"), "154.5");
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    await waitFor(() => expect(addWeightEntry).toHaveBeenCalled());
    // The 409 must be swallowed: no error text, and the dose entry stays logged.
    expect(screen.queryByText("Could not add this entry. Please try again.")).not.toBeInTheDocument();
    expect(screen.queryByText("Weight already logged for this date")).not.toBeInTheDocument();
    expect(screen.queryByText("No entries yet. Log your first dose below if you'd like to track it.")).not.toBeInTheDocument();
  });

  it("shows the load error when fetching the log fails", async () => {
    vi.mocked(getMedicationLogEntries).mockRejectedValue(new Error("boom"));

    renderWithProviders(<MyPlanGlp1View />);

    expect(
      await screen.findByText("Could not load your GLP-1 log. Please try again."),
    ).toBeInTheDocument();
  });
});
