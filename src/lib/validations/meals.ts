import { z } from "zod";

export const MEAL_SLOTS = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"] as const;

export const MEAL_SLOT_LABELS: Record<(typeof MEAL_SLOTS)[number], string> = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
  NIGHT: "Night",
};

export const toggleCheatMealSchema = z.object({
  date: z.string().min(1),
  slot: z.enum(MEAL_SLOTS),
});

export type ToggleCheatMealInput = z.infer<typeof toggleCheatMealSchema>;

export const setCheatMealNoteSchema = z.object({
  date: z.string().min(1),
  slot: z.enum(MEAL_SLOTS),
  note: z.string().trim().max(200).optional(),
});

export type SetCheatMealNoteInput = z.infer<typeof setCheatMealNoteSchema>;
