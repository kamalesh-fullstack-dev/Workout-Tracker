"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { estimatedOneRepMax } from "@/lib/units";
import { getSuggestion, type SetHistoryEntry } from "@/lib/suggestions";
import type { Equipment } from "@/lib/units";
import { recomputeExercisePRs, type NewPR } from "@/lib/prs";
import {
  logSetSchema,
  updateSetSchema,
  type LogSetInput,
  type UpdateSetInput,
} from "@/lib/validations/workout";

type ActionResult = { error: string } | { success: true };
type SetActionResult = { error: string } | { success: true; newPRs: NewPR[] };
type AddExerciseResult =
  | { error: string }
  | { success: true; sessionExerciseId: string };

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
      exerciseId: true,
      workoutSession: { select: { userId: true, completedAt: true } },
    },
  });
  return sessionExercise;
}

export async function addExerciseToSessionAction(
  sessionId: string,
  exerciseId: string
): Promise<AddExerciseResult> {
  const user = await requireUser();
  await assertSessionOwnership(sessionId, user.id);

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

  const sessionExercise = await db.sessionExercise.create({
    data: {
      workoutSessionId: sessionId,
      exerciseId,
      order: count,
    },
    select: { id: true },
  });

  revalidatePath(`/workout/${sessionId}`);
  return { success: true, sessionExerciseId: sessionExercise.id };
}

export async function groupExercisesAction(
  sessionExerciseIds: string[]
): Promise<ActionResult> {
  const user = await requireUser();

  if (sessionExerciseIds.length < 2) {
    return { error: "Pick at least two exercises to group." };
  }

  const rows = await db.sessionExercise.findMany({
    where: { id: { in: sessionExerciseIds } },
    select: {
      id: true,
      workoutSessionId: true,
      workoutSession: { select: { userId: true } },
    },
  });

  const sessionId = rows[0]?.workoutSession.userId === user.id
    ? rows[0].workoutSessionId
    : null;
  const allValid =
    rows.length === sessionExerciseIds.length &&
    sessionId !== null &&
    rows.every(
      (r) => r.workoutSession.userId === user.id && r.workoutSessionId === sessionId
    );

  if (!allValid || !sessionId) {
    return { error: "Exercises not found in this workout." };
  }

  const groupId = crypto.randomUUID();
  await db.sessionExercise.updateMany({
    where: { id: { in: sessionExerciseIds } },
    data: { groupId },
  });

  revalidatePath(`/workout/${sessionId}`);
  return { success: true };
}

export async function ungroupExercisesAction(
  sessionExerciseId: string
): Promise<ActionResult> {
  const user = await requireUser();
  const sessionExercise = await getSessionIdForSessionExercise(sessionExerciseId);

  if (!sessionExercise || sessionExercise.workoutSession.userId !== user.id) {
    return { error: "Exercise not found in this workout." };
  }

  const current = await db.sessionExercise.findUnique({
    where: { id: sessionExerciseId },
    select: { groupId: true },
  });
  if (!current?.groupId) {
    return { success: true };
  }

  await db.sessionExercise.updateMany({
    where: { groupId: current.groupId, workoutSessionId: sessionExercise.workoutSessionId },
    data: { groupId: null },
  });

  revalidatePath(`/workout/${sessionExercise.workoutSessionId}`);
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

  await db.sessionExercise.delete({ where: { id: sessionExerciseId } });
  await recomputeExercisePRs(user.id, sessionExercise.exerciseId);

  revalidatePath(`/workout/${sessionExercise.workoutSessionId}`);
  revalidatePath("/prs");
  return { success: true };
}

export async function logSetAction(input: LogSetInput): Promise<SetActionResult> {
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

  const setCount = await db.setEntry.count({
    where: { sessionExerciseId: parsed.data.sessionExerciseId },
  });

  await db.setEntry.create({
    data: {
      sessionExerciseId: parsed.data.sessionExerciseId,
      userId: user.id,
      exerciseId: sessionExercise.exerciseId,
      setNumber: setCount + 1,
      weightKg: parsed.data.weightKg,
      reps: parsed.data.reps,
      rpe: parsed.data.rpe ?? null,
      isWarmup: parsed.data.isWarmup ?? false,
      isDropSet: parsed.data.isDropSet ?? false,
      isCompleted: true,
      completedAt: new Date(),
      estimated1RM: estimatedOneRepMax(parsed.data.weightKg, parsed.data.reps),
    },
  });

  const newPRs =
    parsed.data.isWarmup || parsed.data.isDropSet
      ? []
      : await recomputeExercisePRs(user.id, sessionExercise.exerciseId);

  revalidatePath(`/workout/${sessionExercise.workoutSessionId}`);
  revalidatePath("/prs");
  return { success: true, newPRs };
}

export async function updateSetAction(
  input: UpdateSetInput
): Promise<SetActionResult> {
  const user = await requireUser();

  const parsed = updateSetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid set." };
  }

  const set = await db.setEntry.findUnique({
    where: { id: parsed.data.setId },
    select: {
      userId: true,
      exerciseId: true,
      isWarmup: true,
      isDropSet: true,
      sessionExercise: { select: { workoutSessionId: true } },
    },
  });
  if (!set || set.userId !== user.id) {
    return { error: "Set not found." };
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

  const newPRs =
    set.isWarmup || set.isDropSet
      ? []
      : await recomputeExercisePRs(user.id, set.exerciseId);

  revalidatePath(`/workout/${set.sessionExercise.workoutSessionId}`);
  revalidatePath("/prs");
  return { success: true, newPRs };
}

export async function deleteSetAction(setId: string): Promise<ActionResult> {
  const user = await requireUser();

  const set = await db.setEntry.findUnique({
    where: { id: setId },
    select: {
      userId: true,
      exerciseId: true,
      sessionExercise: { select: { workoutSessionId: true } },
    },
  });
  if (!set || set.userId !== user.id) {
    return { error: "Set not found." };
  }

  await db.setEntry.delete({ where: { id: setId } });
  await recomputeExercisePRs(user.id, set.exerciseId);

  revalidatePath(`/workout/${set.sessionExercise.workoutSessionId}`);
  revalidatePath("/prs");
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

export async function deleteWorkoutSessionAction(
  sessionId: string
): Promise<ActionResult> {
  const user = await requireUser();
  await assertSessionOwnership(sessionId, user.id);

  const affectedExerciseIds = await db.sessionExercise
    .findMany({
      where: { workoutSessionId: sessionId },
      select: { exerciseId: true },
      distinct: ["exerciseId"],
    })
    .then((rows) => rows.map((r) => r.exerciseId));

  await db.workoutSession.delete({ where: { id: sessionId } });

  for (const exerciseId of affectedExerciseIds) {
    await recomputeExercisePRs(user.id, exerciseId);
  }

  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath("/prs");
  return { success: true };
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

/**
 * Fetches a weight/reps suggestion for one exercise. Server-only helper (not
 * an action) so it can be called in parallel with Promise.all when rendering
 * the workout page, with zero added round-trip latency.
 */
export async function fetchSuggestionForExercise(
  userId: string,
  exerciseId: string,
  routineTarget?: { reps: number | null; weightKg: number | null }
) {
  const exercise = await db.exercise.findUniqueOrThrow({
    where: { id: exerciseId },
    select: { equipment: true },
  });

  const history = await db.setEntry.findMany({
    where: { userId, exerciseId },
    orderBy: { completedAt: "desc" },
    take: 60,
    select: {
      sessionExerciseId: true,
      weightKg: true,
      reps: true,
      rpe: true,
      isWarmup: true,
      isDropSet: true,
      completedAt: true,
    },
  });

  const historyEntries: SetHistoryEntry[] = history
    .filter((s) => s.completedAt != null)
    .map((s) => ({
      sessionExerciseId: s.sessionExerciseId,
      weightKg: Number(s.weightKg),
      reps: s.reps,
      rpe: s.rpe ? Number(s.rpe) : null,
      isWarmup: s.isWarmup,
      isDropSet: s.isDropSet,
      completedAt: s.completedAt as Date,
    }));

  return getSuggestion(historyEntries, {
    equipment: exercise.equipment as Equipment,
    routineTarget,
  });
}
