import { db } from "@/lib/db";
import { estimatedOneRepMax } from "@/lib/units";

export type ProgressPoint = {
  date: string;
  bestE1RM: number;
  maxWeight: number;
  volume: number;
};

/**
 * One data point per workout session in which the exercise was performed,
 * sorted chronologically. Volume is the session's total (weight x reps)
 * across that exercise's non-warmup sets; bestE1RM/maxWeight are the best
 * single-set values within that session.
 */
export async function getExerciseProgressData(
  userId: string,
  exerciseId: string
): Promise<ProgressPoint[]> {
  const sets = await db.setEntry.findMany({
    where: { userId, exerciseId, isWarmup: false, isCompleted: true },
    select: {
      weightKg: true,
      reps: true,
      estimated1RM: true,
      sessionExercise: {
        select: {
          workoutSession: { select: { id: true, startedAt: true } },
        },
      },
    },
  });

  const bySession = new Map<
    string,
    { date: Date; bestE1RM: number; maxWeight: number; volume: number }
  >();

  for (const set of sets) {
    const session = set.sessionExercise.workoutSession;
    const weight = Number(set.weightKg);
    const e1rm =
      set.estimated1RM != null
        ? Number(set.estimated1RM)
        : estimatedOneRepMax(weight, set.reps);
    const volume = weight * set.reps;

    const existing = bySession.get(session.id);
    if (!existing) {
      bySession.set(session.id, {
        date: session.startedAt,
        bestE1RM: e1rm,
        maxWeight: weight,
        volume,
      });
    } else {
      existing.bestE1RM = Math.max(existing.bestE1RM, e1rm);
      existing.maxWeight = Math.max(existing.maxWeight, weight);
      existing.volume += volume;
    }
  }

  return Array.from(bySession.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((p) => ({
      date: p.date.toISOString(),
      bestE1RM: Math.round(p.bestE1RM * 10) / 10,
      maxWeight: p.maxWeight,
      volume: Math.round(p.volume),
    }));
}
