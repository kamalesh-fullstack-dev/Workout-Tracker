"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import {
  logSetSchema,
  updateSetSchema,
  type LogSetInput,
  type UpdateSetInput,
} from "@/lib/validations/workout";

type ActionResult = { error: string } | { success: true };

function estimatedOneRepMax(weightKg: number, reps: number) {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export async function startWorkoutAction() {
  const user = await requireUser();

  const session = await db.workoutSession.create({
    data: { userId: user.id },
    select: { id: true },
  });

  redirect(`/workout/${session.id}`);
}

async function assertSessionOwnership(sessionId: string, userId: string) {
  const session = await db.workoutSession.findUnique({
    where: { id: sessionId },
    select: { userId: true, completedAt: true },
  });
  if (!session || session.userId !== userId) {
    throw new Error("Workout session not found.");
  }
  return session;
}

async function getSessionIdForSessionExercise(sessionExerciseId: string) {
  const sessionExercise = await db.sessionExercise.findUnique({
    where: { id: sessionExerciseId },
    select: {
      workoutSessionId: true,
      workoutSession: { select: { userId: true, completedAt: true } },
    },
  });
  return sessionExercise;
}

export async function addExerciseToSessionAction(
  sessionId: string,
  exerciseId: string
): Promise<ActionResult> {
  const user = await requireUser();
  const session = await assertSessionOwnership(sessionId, user.id);
  if (session.completedAt) {
    return { error: "This workout is already finished." };
  }

  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
    select: { id: true },
  });
  if (!exercise) {
    return { error: "Exercise not found." };
  }

  const count = await db.sessionExercise.count({
    where: { workoutSessionId: sessionId },
  });

  await db.sessionExercise.create({
    data: {
      workoutSessionId: sessionId,
      exerciseId,
      order: count,
    },
  });

  revalidatePath(`/workout/${sessionId}`);
  return { success: true };
}

export async function removeExerciseFromSessionAction(
  sessionExerciseId: string
): Promise<ActionResult> {
  const user = await requireUser();
  const sessionExercise = await getSessionIdForSessionExercise(sessionExerciseId);

  if (!sessionExercise || sessionExercise.workoutSession.userId !== user.id) {
    return { error: "Exercise not found in this workout." };
  }
  if (sessionExercise.workoutSession.completedAt) {
    return { error: "This workout is already finished." };
  }

  await db.sessionExercise.delete({ where: { id: sessionExerciseId } });

  revalidatePath(`/workout/${sessionExercise.workoutSessionId}`);
  return { success: true };
}

export async function logSetAction(input: LogSetInput): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = logSetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid set." };
  }

  const sessionExercise = await getSessionIdForSessionExercise(
    parsed.data.sessionExerciseId
  );
  if (!sessionExercise || sessionExercise.workoutSession.userId !== user.id) {
    return { error: "Exercise not found in this workout." };
  }
  if (sessionExercise.workoutSession.completedAt) {
    return { error: "This workout is already finished." };
  }

  const setCount = await db.setEntry.count({
    where: { sessionExerciseId: parsed.data.sessionExerciseId },
  });

  const fullSessionExercise = await db.sessionExercise.findUniqueOrThrow({
    where: { id: parsed.data.sessionExerciseId },
    select: { exerciseId: true },
  });

  await db.setEntry.create({
    data: {
      sessionExerciseId: parsed.data.sessionExerciseId,
      userId: user.id,
      exerciseId: fullSessionExercise.exerciseId,
      setNumber: setCount + 1,
      weightKg: parsed.data.weightKg,
      reps: parsed.data.reps,
      rpe: parsed.data.rpe ?? null,
      isWarmup: parsed.data.isWarmup ?? false,
      isCompleted: true,
      completedAt: new Date(),
      estimated1RM: estimatedOneRepMax(parsed.data.weightKg, parsed.data.reps),
    },
  });

  revalidatePath(`/workout/${sessionExercise.workoutSessionId}`);
  return { success: true };
}

export async function updateSetAction(
  input: UpdateSetInput
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = updateSetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid set." };
  }

  const set = await db.setEntry.findUnique({
    where: { id: parsed.data.setId },
    select: {
      userId: true,
      sessionExercise: {
        select: { workoutSessionId: true, workoutSession: { select: { completedAt: true } } },
      },
    },
  });
  if (!set || set.userId !== user.id) {
    return { error: "Set not found." };
  }
  if (set.sessionExercise.workoutSession.completedAt) {
    return { error: "This workout is already finished." };
  }

  await db.setEntry.update({
    where: { id: parsed.data.setId },
    data: {
      weightKg: parsed.data.weightKg,
      reps: parsed.data.reps,
      rpe: parsed.data.rpe ?? null,
      estimated1RM: estimatedOneRepMax(parsed.data.weightKg, parsed.data.reps),
    },
  });

  revalidatePath(`/workout/${set.sessionExercise.workoutSessionId}`);
  return { success: true };
}

export async function deleteSetAction(setId: string): Promise<ActionResult> {
  const user = await requireUser();

  const set = await db.setEntry.findUnique({
    where: { id: setId },
    select: {
      userId: true,
      sessionExercise: {
        select: { workoutSessionId: true, workoutSession: { select: { completedAt: true } } },
      },
    },
  });
  if (!set || set.userId !== user.id) {
    return { error: "Set not found." };
  }
  if (set.sessionExercise.workoutSession.completedAt) {
    return { error: "This workout is already finished." };
  }

  await db.setEntry.delete({ where: { id: setId } });

  revalidatePath(`/workout/${set.sessionExercise.workoutSessionId}`);
  return { success: true };
}

export async function finishWorkoutAction(sessionId: string) {
  const user = await requireUser();
  await assertSessionOwnership(sessionId, user.id);

  await db.workoutSession.update({
    where: { id: sessionId },
    data: { completedAt: new Date() },
  });

  revalidatePath("/history");
  redirect(`/history`);
}

export async function searchExercisesForPickerAction(query: string) {
  const user = await requireUser();

  return db.exercise.findMany({
    where: {
      OR: [{ isCustom: false }, { createdById: user.id }],
      ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
    take: 25,
    select: { id: true, name: true, equipment: true },
  });
}
