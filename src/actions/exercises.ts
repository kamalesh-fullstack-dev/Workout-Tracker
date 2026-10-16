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

export async function updateExerciseAction(
  exerciseId: string,
  values: CreateExerciseInput
): Promise<ActionResult> {
  const user = await requireUser();

  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
    select: { createdById: true, isCustom: true },
  });

  if (!exercise || !exercise.isCustom || exercise.createdById !== user.id) {
    return { error: "You can only edit exercises you created." };
  }

  const parsed = createExerciseSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await db.exercise.update({
    where: { id: exerciseId },
    data: parsed.data,
  });

  revalidatePath("/exercises");
  revalidatePath(`/exercises/${exerciseId}`);
  return { success: true };
}

type QuickCreateResult =
  | { error: string }
  | {
      success: true;
      exercise: { id: string; name: string; equipment: string };
      existed: boolean;
    };

/**
 * Lets a custom exercise be created without leaving the "Add exercise"
 * picker mid-workout — just a name, with sensible defaults for everything
 * else (edit it properly later via the exercise's own edit page).
 *
 * Find-or-create by name (case-insensitive, scoped to exercises this user
 * can already see): the picker hides this option when an exact match is
 * already in the visible results, but this is the actual guard against a
 * duplicate — e.g. a stale results list, or two taps in quick succession.
 */
export async function quickCreateExerciseAction(
  name: string
): Promise<QuickCreateResult> {
  const user = await requireUser();

  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { error: "Name is too short." };
  }

  const existing = await db.exercise.findFirst({
    where: {
      name: { equals: trimmed, mode: "insensitive" },
      OR: [{ isCustom: false }, { createdById: user.id }],
    },
    select: { id: true, name: true, equipment: true },
  });
  if (existing) {
    return { success: true, exercise: existing, existed: true };
  }

  const exercise = await db.exercise.create({
    data: {
      name: trimmed,
      muscleGroups: [],
      isCustom: true,
      createdById: user.id,
    },
    select: { id: true, name: true, equipment: true },
  });

  revalidatePath("/exercises");
  return { success: true, exercise, existed: false };
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
