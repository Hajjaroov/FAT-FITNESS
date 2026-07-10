export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type Exercise = {
  id: string;
  name: string;
  nameDe: string | null;
  photoSrc: string | null;
};

export type WorkoutPlanDayExercise = {
  id: string;
  exerciseId: string | null;
  name: string;
  sets: string;
};

export type WorkoutPlanDay = {
  id: string;
  title: string;
  weekday: Weekday | null;
  position: number;
  exercises: WorkoutPlanDayExercise[];
  updatedAt: string;
};
