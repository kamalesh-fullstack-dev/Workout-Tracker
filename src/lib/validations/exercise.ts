import { z } from "zod";

export const EXERCISE_CATEGORIES = [
  "STRENGTH",
  "CARDIO",
  "MOBILITY",
  "PLYOMETRIC",
  "OTHER",
] as const;

export const MUSCLE_GROUPS = [
  "CHEST",
  "BACK",
  "SHOULDERS",
  "BICEPS",
  "TRICEPS",
  "FOREARMS",
  "QUADS",
  "HAMSTRINGS",
  "GLUTES",
  "CALVES",
  "CORE",
  "FULL_BODY",
  "CARDIO",
] as const;

export const EQUIPMENT_TYPES = [
  "BARBELL",
  "DUMBBELL",
  "MACHINE",
  "CABLE",
  "BODYWEIGHT",
  "KETTLEBELL",
  "BAND",
  "OTHER",
] as const;

export const TRACKING_TYPES = [
  "WEIGHT_REPS",
  "BODYWEIGHT_REPS",
  "TIME",
  "DISTANCE",
] as const;

export const MUSCLE_GROUP_LABELS: Record<(typeof MUSCLE_GROUPS)[number], string> = {
  CHEST: "Chest",
  BACK: "Back",
  SHOULDERS: "Shoulders",
  BICEPS: "Biceps",
  TRICEPS: "Triceps",
  FOREARMS: "Forearms",
  QUADS: "Quads",
  HAMSTRINGS: "Hamstrings",
  GLUTES: "Glutes",
  CALVES: "Calves",
  CORE: "Core",
  FULL_BODY: "Full Body",
  CARDIO: "Cardio",
};

export const EQUIPMENT_LABELS: Record<(typeof EQUIPMENT_TYPES)[number], string> = {
  BARBELL: "Barbell",
  DUMBBELL: "Dumbbell",
  MACHINE: "Machine",
  CABLE: "Cable",
  BODYWEIGHT: "Bodyweight",
  KETTLEBELL: "Kettlebell",
  BAND: "Band",
  OTHER: "Other",
};

export const TRACKING_TYPE_LABELS: Record<(typeof TRACKING_TYPES)[number], string> = {
  WEIGHT_REPS: "Weight x Reps",
  BODYWEIGHT_REPS: "Bodyweight Reps",
  TIME: "Time",
  DISTANCE: "Distance",
};

export const createExerciseSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  category: z.enum(EXERCISE_CATEGORIES),
  muscleGroups: z
    .array(z.enum(MUSCLE_GROUPS))
    .min(1, "Pick at least one muscle group"),
  equipment: z.enum(EQUIPMENT_TYPES),
  trackingType: z.enum(TRACKING_TYPES),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
