import type { EQUIPMENT_TYPES } from "@/lib/validations/exercise";

export type Equipment = (typeof EQUIPMENT_TYPES)[number];

/** Smallest sensible weight jump per equipment type, in kg. */
export const EQUIPMENT_INCREMENT_KG: Record<Equipment, number> = {
  BARBELL: 2.5,
  DUMBBELL: 2,
  MACHINE: 2.5,
  CABLE: 2.5,
  KETTLEBELL: 4,
  BODYWEIGHT: 0,
  BAND: 0,
  OTHER: 2.5,
};

/** Epley formula: estimated 1-rep max from a weight x reps performance. */
export function estimatedOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export function roundToIncrement(value: number, increment: number): number {
  if (increment <= 0) return Math.round(value * 100) / 100;
  return Math.round(value / increment) * increment;
}
