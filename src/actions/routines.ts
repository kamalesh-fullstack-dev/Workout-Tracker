"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { saveRoutineSchema, type SaveRoutineInput } from "@/lib/validations/routine";

type ActionResult = { error: string } | { success: true; routineId: string };

export async function saveRoutineAction(
  input: SaveRoutineInput
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = saveRoutineSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid routine." };
  }
  const { routineId, name, description, exercises } = parsed.data;

  if (routineId) {
    const existing = await db.routineTemplate.findUnique({
      where: { id: routineId },
      select: { userId: true },
    });
    if (!existing || existing.userId !== user.id) {
      return { error: "Routine not found." };
    }

    await db.$transaction([
      db.routineExercise.deleteMany({ where: { routineId } }),
      db.routineTemplate.update({
        where: { id: routineId },
        data: {
          name,
          description,
          exercises: {
            create: exercises.map((ex, index) => ({
              exerciseId: ex.exerciseId,
              order: index,
              restSeconds: ex.restSeconds ?? null,
              targetSets: {
                create: ex.targetSets.map((s, setIndex) => ({
                  setNumber: setIndex + 1,
                  targetReps: s.targetReps ?? null,
                  targetWeightKg: s.targetWeightKg ?? null,
                })),
              },
            })),
          },
        },
      }),
    ]);

    revalidatePath("/routines");
    revalidatePath(`/routines/${routineId}`);
    return { success: true, routineId };
  }

  const created = await db.routineTemplate.create({
    data: {
      userId: user.id,
      name,
      description,
      exercises: {
        create: exercises.map((ex, index) => ({
          exerciseId: ex.exerciseId,
          order: index,
          restSeconds: ex.restSeconds ?? null,
          targetSets: {
            create: ex.targetSets.map((s, setIndex) => ({
              setNumber: setIndex + 1,
              targetReps: s.targetReps ?? null,
              targetWeightKg: s.targetWeightKg ?? null,
            })),
          },
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/routines");
  return { success: true, routineId: created.id };
}

export async function deleteRoutineAction(
  routineId: string
): Promise<{ error: string } | { success: true }> {
  const user = await requireUser();

  const routine = await db.routineTemplate.findUnique({
    where: { id: routineId },
    select: { userId: true },
  });
  if (!routine || routine.userId !== user.id) {
    return { error: "Routine not found." };
  }

  await db.routineTemplate.delete({ where: { id: routineId } });
  revalidatePath("/routines");
  return { success: true };
}

export async function saveWorkoutAsRoutineAction(
  sessionId: string,
  name: string
): Promise<ActionResult> {
  const user = await requireUser();

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: "Give the routine a name." };
  }

  const session = await db.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          sets: { where: { isWarmup: false }, orderBy: { setNumber: "asc" } },
        },
      },
    },
  });
  if (!session || session.userId !== user.id) {
    return { error: "Workout not found." };
  }
  if (session.exercises.length === 0) {
    return { error: "Add at least one exercise before saving this as a routine." };
  }

  const created = await db.routineTemplate.create({
    data: {
      userId: user.id,
      name: trimmedName,
      exercises: {
        create: session.exercises.map((se, index) => ({
          exerciseId: se.exerciseId,
          order: index,
          restSeconds: se.restSeconds,
          targetSets: {
            create:
              se.sets.length > 0
                ? se.sets.map((s, setIndex) => ({
                    setNumber: setIndex + 1,
                    targetReps: s.reps,
                    targetWeightKg: s.weightKg,
                  }))
                : [{ setNumber: 1, targetReps: null, targetWeightKg: null }],
          },
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/routines");
  return { success: true, routineId: created.id };
}

export async function startWorkoutFromRoutineAction(routineId: string) {
  const user = await requireUser();

  const routine = await db.routineTemplate.findUnique({
    where: { id: routineId },
    include: { exercises: { orderBy: { order: "asc" } } },
  });
  if (!routine || routine.userId !== user.id) {
    throw new Error("Routine not found.");
  }

  const session = await db.workoutSession.create({
    data: {
      userId: user.id,
      routineId: routine.id,
      name: routine.name,
      exercises: {
        create: routine.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          order: ex.order,
          restSeconds: ex.restSeconds,
        })),
      },
    },
    select: { id: true },
  });

  redirect(`/workout/${session.id}`);
}
