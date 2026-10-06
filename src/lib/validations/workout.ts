import { z } from "zod";

export const logSetSchema = z.object({
  sessionExerciseId: z.string().min(1),
  weightKg: z.coerce.number().min(0).max(1000),
  reps: z.coerce.number().int().min(1).max(999),
  rpe: z.coerce.number().min(1).max(10).optional().nullable(),
  isWarmup: z.boolean().optional().default(false),
  isDropSet: z.boolean().optional().default(false),
});

export type LogSetInput = z.infer<typeof logSetSchema>;

export const updateSetSchema = z.object({
  setId: z.string().min(1),
  weightKg: z.coerce.number().min(0).max(1000),
  reps: z.coerce.number().int().min(1).max(999),
  rpe: z.coerce.number().min(1).max(10).optional().nullable(),
});

export type UpdateSetInput = z.infer<typeof updateSetSchema>;

export const updateSessionTimesSchema = z
  .object({
    sessionId: z.string().min(1),
    startedAt: z.coerce.date(),
    completedAt: z.coerce.date().optional().nullable(),
  })
  .refine(
    (data) => !data.completedAt || data.completedAt >= data.startedAt,
    { message: "Finish time can't be before the start time.", path: ["completedAt"] }
  );

export type UpdateSessionTimesInput = z.infer<typeof updateSessionTimesSchema>;
