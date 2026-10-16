import { db } from "@/lib/db";
import { estimatedOneRepMax } from "@/lib/units";

export type LastSessionSet = {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe: number | null;
  isWarmup: boolean;
};

/**
 * The full set of sets logged the last time this exercise was done — not
 * just the previous session's best, but every set from that one session —
 * so it can stay visible as a reference while logging the current one.
 *
 * excludeWorkoutSessionId keeps this pinned to a genuinely *previous*
 * session: without it, logging a set in the session being viewed makes
 * that set the most recent completed one, and this would start mirroring
 * the sets being logged right now instead of staying fixed as a reference.
 */
export async function getLastSessionSets(
  userId: string,
  exerciseId: string,
  excludeWorkoutSessionId?: string
): Promise<LastSessionSet[]> {
  const mostRecentSet = await db.setEntry.findFirst({
    where: {
      userId,
      exerciseId,
      isCompleted: true,
      ...(excludeWorkoutSessionId
        ? {
            sessionExercise: {
              workoutSessionId: { not: excludeWorkoutSessionId },
            },
          }
        : {}),
    },
    orderBy: { completedAt: "desc" },
    select: { sessionExerciseId: true },
  });
  if (!mostRecentSet) return [];

  const sets = await db.setEntry.findMany({
    where: { sessionExerciseId: mostRecentSet.sessionExerciseId },
    orderBy: { setNumber: "asc" },
    select: {
      setNumber: true,
      weightKg: true,
      reps: true,
      rpe: true,
      isWarmup: true,
    },
  });

  return sets.map((s) => ({
    setNumber: s.setNumber,
    weightKg: Number(s.weightKg),
    reps: s.reps,
    rpe: s.rpe != null ? Number(s.rpe) : null,
    isWarmup: s.isWarmup,
  }));
}

export type ProgressPoint = {
  date: string;
  bestE1RM: number;
  maxWeight: number;
  volume: number;
  setCount: number;
};

/**
 * One data point per workout session in which the exercise was performed,
 * sorted chronologically. Volume is the session's total (weight x reps)
 * across that exercise's non-warmup sets; bestE1RM/maxWeight are the best
 * single-set values within that session; setCount is every completed set
 * (warmups and drop sets included, same as the overall "total sets" chart).
 */
export async function getExerciseProgressData(
  userId: string,
  exerciseId: string
): Promise<ProgressPoint[]> {
  const sets = await db.setEntry.findMany({
    where: { userId, exerciseId, isCompleted: true },
    select: {
      weightKg: true,
      reps: true,
      estimated1RM: true,
      isWarmup: true,
      isDropSet: true,
      sessionExercise: {
        select: {
          workoutSession: { select: { id: true, startedAt: true } },
        },
      },
    },
  });

  const bySession = new Map<
    string,
    {
      date: Date;
      bestE1RM: number;
      maxWeight: number;
      volume: number;
      setCount: number;
    }
  >();

  for (const set of sets) {
    const session = set.sessionExercise.workoutSession;
    const weight = Number(set.weightKg);
    const isWorkingSet = !set.isWarmup && !set.isDropSet;
    const e1rm =
      set.estimated1RM != null
        ? Number(set.estimated1RM)
        : estimatedOneRepMax(weight, set.reps);
    const volume = weight * set.reps;

    const existing = bySession.get(session.id);
    if (!existing) {
      bySession.set(session.id, {
        date: session.startedAt,
        bestE1RM: isWorkingSet ? e1rm : 0,
        maxWeight: isWorkingSet ? weight : 0,
        volume: isWorkingSet ? volume : 0,
        setCount: 1,
      });
    } else {
      if (isWorkingSet) {
        existing.bestE1RM = Math.max(existing.bestE1RM, e1rm);
        existing.maxWeight = Math.max(existing.maxWeight, weight);
        existing.volume += volume;
      }
      existing.setCount += 1;
    }
  }

  return Array.from(bySession.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((p) => ({
      date: p.date.toISOString(),
      bestE1RM: Math.round(p.bestE1RM * 10) / 10,
      maxWeight: p.maxWeight,
      volume: Math.round(p.volume),
      setCount: p.setCount,
    }));
}

export type OverallProgressPoint = {
  date: string;
  totalSets: number;
  totalVolume: number;
};

/**
 * One data point per workout session across every exercise — not scoped to
 * one exercise like getExerciseProgressData. totalSets counts every
 * completed set (warmups and drop sets included, since it's meant to track
 * overall training density); totalVolume only counts working sets, same as
 * the per-exercise volume figure, so it tracks real load progression.
 */
export async function getOverallProgressData(
  userId: string
): Promise<OverallProgressPoint[]> {
  const sets = await db.setEntry.findMany({
    where: { userId, isCompleted: true },
    select: {
      weightKg: true,
      reps: true,
      isWarmup: true,
      isDropSet: true,
      sessionExercise: {
        select: {
          workoutSession: { select: { id: true, startedAt: true } },
        },
      },
    },
  });

  const bySession = new Map<
    string,
    { date: Date; totalSets: number; totalVolume: number }
  >();

  for (const set of sets) {
    const session = set.sessionExercise.workoutSession;
    const existing = bySession.get(session.id) ?? {
      date: session.startedAt,
      totalSets: 0,
      totalVolume: 0,
    };
    existing.totalSets += 1;
    if (!set.isWarmup && !set.isDropSet) {
      existing.totalVolume += Number(set.weightKg) * set.reps;
    }
    bySession.set(session.id, existing);
  }

  return Array.from(bySession.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((p) => ({
      date: p.date.toISOString(),
      totalSets: p.totalSets,
      totalVolume: Math.round(p.totalVolume),
    }));
}
