import { db } from "@/lib/db";

function toNum(value: unknown): number | null {
  return value == null ? null : Number(value);
}

/**
 * Everything this user owns, in one structured dump — full relational
 * fidelity (not flattened), so it can be re-imported or read on its own if
 * the app is ever unusable. Shared library exercises (isCustom: false) are
 * intentionally left out: they're seed data, not something the user created
 * or needs backed up, and referencing them by name in each logged set is
 * enough to make the dump self-describing without re-exporting the library.
 */
export async function getUserExportData(userId: string) {
  const [
    user,
    customExercises,
    routines,
    sessions,
    personalRecords,
    bodyMetrics,
    bodyMeasurements,
    cheatMeals,
  ] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        unitPreference: true,
        createdAt: true,
      },
    }),
    db.exercise.findMany({
      where: { createdById: userId },
      select: {
        name: true,
        category: true,
        muscleGroups: true,
        equipment: true,
        trackingType: true,
        createdAt: true,
      },
    }),
    db.routineTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        name: true,
        description: true,
        createdAt: true,
        exercises: {
          orderBy: { order: "asc" },
          select: {
            order: true,
            restSeconds: true,
            groupId: true,
            exercise: { select: { name: true } },
            targetSets: {
              orderBy: { setNumber: "asc" },
              select: {
                setNumber: true,
                targetReps: true,
                targetWeightKg: true,
                isWarmup: true,
                isDropSet: true,
              },
            },
          },
        },
      },
    }),
    db.workoutSession.findMany({
      where: { userId },
      orderBy: { startedAt: "asc" },
      select: {
        name: true,
        startedAt: true,
        completedAt: true,
        notes: true,
        routine: { select: { name: true } },
        exercises: {
          orderBy: { order: "asc" },
          select: {
            order: true,
            restSeconds: true,
            notes: true,
            groupId: true,
            exercise: { select: { name: true } },
            sets: {
              orderBy: { setNumber: "asc" },
              select: {
                setNumber: true,
                weightKg: true,
                reps: true,
                rpe: true,
                isWarmup: true,
                isDropSet: true,
                isCompleted: true,
                completedAt: true,
                estimated1RM: true,
                isPR: true,
              },
            },
          },
        },
      },
    }),
    db.personalRecord.findMany({
      where: { userId },
      orderBy: { achievedAt: "desc" },
      select: {
        type: true,
        value: true,
        achievedAt: true,
        exercise: { select: { name: true } },
      },
    }),
    db.bodyMetricEntry.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true, weightKg: true, note: true },
    }),
    db.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true, type: true, valueCm: true },
    }),
    db.cheatMeal.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true, slot: true, note: true },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    user,
    customExercises,
    routines: routines.map((r) => ({
      ...r,
      exercises: r.exercises.map((re) => ({
        order: re.order,
        restSeconds: re.restSeconds,
        groupId: re.groupId,
        exerciseName: re.exercise.name,
        targetSets: re.targetSets.map((ts) => ({
          ...ts,
          targetWeightKg: toNum(ts.targetWeightKg),
        })),
      })),
    })),
    workoutSessions: sessions.map((s) => ({
      name: s.name,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      notes: s.notes,
      routineName: s.routine?.name ?? null,
      exercises: s.exercises.map((se) => ({
        order: se.order,
        restSeconds: se.restSeconds,
        notes: se.notes,
        groupId: se.groupId,
        exerciseName: se.exercise.name,
        sets: se.sets.map((set) => ({
          setNumber: set.setNumber,
          weightKg: toNum(set.weightKg),
          reps: set.reps,
          rpe: toNum(set.rpe),
          isWarmup: set.isWarmup,
          isDropSet: set.isDropSet,
          isCompleted: set.isCompleted,
          completedAt: set.completedAt,
          estimated1RM: toNum(set.estimated1RM),
          isPR: set.isPR,
        })),
      })),
    })),
    personalRecords: personalRecords.map((pr) => ({
      exerciseName: pr.exercise.name,
      type: pr.type,
      value: toNum(pr.value),
      achievedAt: pr.achievedAt,
    })),
    bodyMetrics: bodyMetrics.map((b) => ({
      date: b.date,
      weightKg: toNum(b.weightKg),
      note: b.note,
    })),
    bodyMeasurements: bodyMeasurements.map((m) => ({
      date: m.date,
      type: m.type,
      valueCm: toNum(m.valueCm),
    })),
    cheatMeals,
  };
}

export type UserExportData = Awaited<ReturnType<typeof getUserExportData>>;
