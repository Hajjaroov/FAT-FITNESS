export type Food = {
  id: string;
  name: string;
  nameDe: string | null;
  unitLabel: string;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  carbsPerUnit: number;
  fatPerUnit: number;
};

export type DietMealItem = {
  id: string;
  foodId: string | null;
  name: string;
  unitLabel: string | null;
  quantity: number;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  carbsPerUnit: number;
  fatPerUnit: number;
};

export type DietMeal = {
  id: string;
  title: string;
  position: number;
  items: DietMealItem[];
  updatedAt: string;
};

export type FoodMacroCheckStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export type FoodMacroCheck = {
  id: string;
  targetFood: Food;
  proposedName: string | null;
  proposedUnitLabel: string | null;
  proposedCaloriesPerUnit: number;
  proposedProteinPerUnit: number;
  proposedCarbsPerUnit: number;
  proposedFatPerUnit: number;
  comment: string | null;
  submittedByDisplayName: string;
  status: FoodMacroCheckStatus;
  createdAt: string;
};
