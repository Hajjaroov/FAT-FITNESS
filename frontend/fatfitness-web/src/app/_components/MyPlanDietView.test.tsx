import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyPlanDietView } from "@/app/_components/MyPlanDietView";
import { renderWithProviders } from "@/test/render";
import { addDietMeal, getDietMeals, getFoods, refreshAuthSession } from "@/lib/api";
import type { DietMeal } from "@/types/diet";

vi.mock("@/lib/api");

const routerReplace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/myplan/diet",
}));

function meal(partial: Partial<DietMeal> & { id: string; title: string }): DietMeal {
  return { position: 1, items: [], updatedAt: "2026-07-01T00:00:00Z", ...partial };
}

const breakfast = meal({
  id: "m1",
  title: "Breakfast",
  items: [
    {
      id: "i1",
      foodId: null,
      name: "Oats",
      unitLabel: "100g",
      quantity: 2,
      caloriesPerUnit: 100,
      proteinPerUnit: 10,
      carbsPerUnit: 5,
      fatPerUnit: 2,
    },
    {
      id: "i2",
      foodId: null,
      name: "Milk",
      unitLabel: "100ml",
      quantity: 1.5,
      caloriesPerUnit: 60,
      proteinPerUnit: 3,
      carbsPerUnit: 8,
      fatPerUnit: 1,
    },
  ],
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("MyPlanDietView", () => {
  it("redirects anonymous visitors to /login", async () => {
    vi.mocked(refreshAuthSession).mockRejectedValue(new Error("no session"));

    renderWithProviders(<MyPlanDietView />);

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/login"));
  });

  it("renders fetched meals and computes the day totals from item macros", async () => {
    vi.mocked(refreshAuthSession).mockResolvedValue({ accessToken: "test-token" });
    vi.mocked(getDietMeals).mockResolvedValue([breakfast]);
    vi.mocked(getFoods).mockResolvedValue([]);

    renderWithProviders(<MyPlanDietView />);

    expect(await screen.findByText("Breakfast")).toBeInTheDocument();
    // Oats: 2 × (100 kcal / 10 P / 5 C / 2 F); Milk: 1.5 × (60 / 3 / 8 / 1)
    expect(screen.getByText("290 kcal")).toBeInTheDocument();
    expect(screen.getByText("24.5 g")).toBeInTheDocument();
    expect(screen.getByText("22 g")).toBeInTheDocument();
    expect(screen.getByText("5.5 g")).toBeInTheDocument();
  });

  it("adds a meal and shows it in the list", async () => {
    const user = userEvent.setup();
    vi.mocked(refreshAuthSession).mockResolvedValue({ accessToken: "test-token" });
    vi.mocked(getDietMeals).mockResolvedValue([]);
    vi.mocked(getFoods).mockResolvedValue([]);
    vi.mocked(addDietMeal).mockResolvedValue(meal({ id: "m2", title: "Meal 1" }));

    renderWithProviders(<MyPlanDietView />);

    await user.click(await screen.findByRole("button", { name: "Add a meal" }));

    expect(await screen.findByText("Meal 1")).toBeInTheDocument();
    expect(addDietMeal).toHaveBeenCalledWith(undefined, "test-token");
  });

  it("shows the load error when fetching fails", async () => {
    vi.mocked(refreshAuthSession).mockResolvedValue({ accessToken: "test-token" });
    vi.mocked(getDietMeals).mockRejectedValue(new Error("boom"));
    vi.mocked(getFoods).mockResolvedValue([]);

    renderWithProviders(<MyPlanDietView />);

    expect(
      await screen.findByText("Could not load your diet. Please try again."),
    ).toBeInTheDocument();
  });
});
