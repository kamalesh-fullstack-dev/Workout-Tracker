import { z } from "zod";

export const MEASUREMENT_TYPES = [
  "WAIST",
  "CHEST",
  "HIPS",
  "ARM",
  "THIGH",
  "NECK",
  "CALF",
] as const;

export const MEASUREMENT_TYPE_LABELS: Record<(typeof MEASUREMENT_TYPES)[number], string> = {
  WAIST: "Waist",
  CHEST: "Chest",
  HIPS: "Hips",
  ARM: "Arm",
  THIGH: "Thigh",
  NECK: "Neck",
  CALF: "Calf",
};

export const logBodyWeightSchema = z.object({
  date: z.string().min(1),
  weightKg: z.coerce.number().min(1).max(500),
  note: z.string().trim().max(200).optional(),
});
export type LogBodyWeightInput = z.infer<typeof logBodyWeightSchema>;

export const logMeasurementSchema = z.object({
  date: z.string().min(1),
  type: z.enum(MEASUREMENT_TYPES),
  valueCm: z.coerce.number().min(1).max(300),
});
export type LogMeasurementInput = z.infer<typeof logMeasurementSchema>;
