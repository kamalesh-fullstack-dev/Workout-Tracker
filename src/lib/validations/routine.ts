import { z } from "zod";

export const routineSetSchema = z.object({
  targetReps: z.coerce.number().int().min(1).max(999).optional().nullable(),
  targetWeightKg: z.coerce.number().min(0).max(1000).optional().nullable(),
});

export const routineExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  restSeconds: z.coerce.number().int().min(0).max(3600).optional().nullable(),
  targetSets: z.array(routineSetSchema).min(1, "Add at least one set"),
});

export const saveRoutineSchema = z.object({
  routineId: z.string().optional(),
  name: z.string().trim().min(1, "Name is required").max(80),
  description: z.string().trim().max(300).optional(),
  exercises: z
    .array(routineExerciseSchema)
    .min(1, "Add at least one exercise"),
});

export type SaveRoutineInput = z.infer<typeof saveRoutineSchema>;
export type RoutineExerciseInput = z.infer<typeof routineExerciseSchema>;
export type RoutineSetInput = z.infer<typeof routineSetSchema>;
