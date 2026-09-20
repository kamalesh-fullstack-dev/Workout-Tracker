"use server";

import { requireUser } from "@/actions/auth";
import { getExerciseProgressData } from "@/lib/progress";

export async function getExerciseProgressAction(exerciseId: string) {
  const user = await requireUser();
  return getExerciseProgressData(user.id, exerciseId);
}
