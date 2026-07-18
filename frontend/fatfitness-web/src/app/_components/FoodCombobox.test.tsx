import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FoodCombobox } from "@/app/_components/FoodCombobox";
import { LocaleProvider } from "@/app/_components/LocaleProvider";
import type { Food } from "@/types/diet";

function food(partial: Partial<Food> & { id: string; name: string }): Food {
  return {
    nameDe: null,
    unitLabel: "100g",
    caloriesPerUnit: 100,
    proteinPerUnit: 10,
    carbsPerUnit: 5,
    fatPerUnit: 2,
    ...partial,
  };
}

const chickenBreast = food({ id: "f1", name: "Chicken, breast, raw" });
const babyfoodChicken = food({ id: "f2", name: "Babyfood, chicken, strained" });
const rice = food({ id: "f3", name: "Rice, white, cooked" });
const quark = food({ id: "f4", name: "Low-fat quark", nameDe: "Magerquark" });

function renderCombobox(foods: Food[]) {
  const onValueChange = vi.fn();
  const onSelectFood = vi.fn();
  const props = {
    id: "food-input",
    value: "",
    onValueChange,
    onSelectFood,
    foods,
    placeholder: "Search foods",
    searchHint: "Type to search",
    noResultsLabel: "No results",
  };
  const view = render(
    <LocaleProvider>
      <FoodCombobox {...props} />
    </LocaleProvider>,
  );
  const rerenderWithValue = (value: string) =>
    view.rerender(
      <LocaleProvider>
        <FoodCombobox {...props} value={value} />
      </LocaleProvider>,
    );
  return { onValueChange, onSelectFood, rerenderWithValue };
}

describe("FoodCombobox", () => {
  it("opens on focus and lists all foods for an empty query", async () => {
    const user = userEvent.setup();
    renderCombobox([chickenBreast, rice]);

    await user.click(screen.getByRole("combobox"));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("ranks a name-prefix match above a mid-name substring match", async () => {
    const user = userEvent.setup();
    const { rerenderWithValue } = renderCombobox([babyfoodChicken, chickenBreast, rice]);

    await user.click(screen.getByRole("combobox"));
    rerenderWithValue("chicken");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Chicken, breast, raw");
    expect(options[1]).toHaveTextContent("Babyfood, chicken, strained");
  });

  it("matches the German name even when the UI locale is English", async () => {
    const user = userEvent.setup();
    const { rerenderWithValue } = renderCombobox([chickenBreast, quark]);

    await user.click(screen.getByRole("combobox"));
    rerenderWithValue("magerqu");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Low-fat quark");
  });

  it("selects the active suggestion with Enter and reports it", async () => {
    const user = userEvent.setup();
    const { onValueChange, onSelectFood } = renderCombobox([chickenBreast, rice]);

    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelectFood).toHaveBeenCalledWith(rice);
    expect(onValueChange).toHaveBeenLastCalledWith("Rice, white, cooked");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes the listbox on Escape and shows the empty label for no matches", async () => {
    const user = userEvent.setup();
    const { rerenderWithValue } = renderCombobox([chickenBreast]);

    await user.click(screen.getByRole("combobox"));
    rerenderWithValue("zzzz");
    expect(screen.getByText("No results")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
