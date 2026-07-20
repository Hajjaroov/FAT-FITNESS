import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyPlanGlp1View } from "@/app/_components/MyPlanGlp1View";
import { renderWithProviders } from "@/test/render";
import { addMedicationLogEntry, getMedicationLogEntries } from "@/lib/api";
import type { MedicationLogEntry } from "@/types/glp1";

vi.mock("@/lib/api");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/myplan/glp1",
}));

// The add form defaults its date input to today (local time), so the fixture
// must match — a hard-coded date made this test fail the day after writing it.
function todayISODate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const savedEntry: MedicationLogEntry = {
  id: "e1",
  entryDate: todayISODate(),
  doseMg: 10,
  notes: null,
  updatedAt: "2026-07-18T08:00:00Z",
  weightKg: null,
};

async function openFormAndFillDose(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: "Add entry" }));
  await user.type(screen.getByLabelText("Dose (mg)"), "10");
}

afterEach(() => {
  vi.resetAllMocks();
});

describe("MyPlanGlp1View", () => {
  it("logs a dose with no weight field sent when no weight is typed", async () => {
    const user = userEvent.setup();
    vi.mocked(addMedicationLogEntry).mockResolvedValue(savedEntry);

    renderWithProviders(<MyPlanGlp1View />);

    await openFormAndFillDose(user);
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    await waitFor(() =>
      expect(addMedicationLogEntry).toHaveBeenCalledWith(
        expect.objectContaining({ doseMg: 10, notes: undefined, weightKg: undefined }),
        "test-token",
      ),
    );
  });

  it("sends an optional weight inline in the same add-entry request", async () => {
    const user = userEvent.setup();
    vi.mocked(addMedicationLogEntry).mockResolvedValue({ ...savedEntry, weightKg: 154.5 });

    renderWithProviders(<MyPlanGlp1View />);

    await openFormAndFillDose(user);
    await user.type(screen.getByLabelText("Weight (kg, optional)"), "154.5");
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    await waitFor(() =>
      expect(addMedicationLogEntry).toHaveBeenCalledWith(
        expect.objectContaining({ doseMg: 10, weightKg: 154.5 }),
        "test-token",
      ),
    );
  });

  it("shows the load error when fetching the log fails", async () => {
    vi.mocked(getMedicationLogEntries).mockRejectedValue(new Error("boom"));

    renderWithProviders(<MyPlanGlp1View />);

    expect(
      await screen.findByText("Could not load your GLP-1 log. Please try again."),
    ).toBeInTheDocument();
  });
});
