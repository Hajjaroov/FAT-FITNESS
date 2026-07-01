export type WeightGoal = {
  startWeight: number | null;
  goalWeight: number | null;
  updatedAt: string | null;
};

export type WeightEntry = {
  id: string;
  entryDate: string;
  weightKg: number;
  createdAt: string;
};
