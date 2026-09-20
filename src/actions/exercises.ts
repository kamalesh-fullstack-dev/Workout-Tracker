"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import {
  createExerciseSchema,
  type CreateExerciseInput,
} from "@/lib/validations/exercise";

type ActionResult = { error: string } | { success: true };

export async function createExerciseAction(
  values: CreateExerciseInput
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = createExerciseSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await db.exercise.create({
    data: {
      ...parsed.data,
      isCustom: true,
      createdById: user.id,
    },
  });

  revalidatePath("/exercises");
  return { success: true };
}

export async function deleteExerciseAction(
  exerciseId: string
): Promise<ActionResult> {
  const user = await requireUser();

  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
    select: { createdById: true, isCustom: true },
  });

  if (!exercise || !exercise.isCustom || exercise.createdById !== user.id) {
    return { error: "You can only delete exercises you created." };
  }

  try {
    await db.exercise.delete({ where: { id: exerciseId } });
  } catch {
    return {
      error: "This exercise is used in a routine or workout and can't be deleted.",
    };
  }

  revalidatePath("/exercises");
  return { success: true };
}
