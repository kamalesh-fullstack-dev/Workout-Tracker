import { z } from "zod";

export const createHabitSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;

export const toggleHabitSlipSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().min(1),
});

export type ToggleHabitSlipInput = z.infer<typeof toggleHabitSlipSchema>;
