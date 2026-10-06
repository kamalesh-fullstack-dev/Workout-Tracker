import { db } from "@/lib/db";
import { estimatedOneRepMax } from "@/lib/units";
import { PR_TYPES, type PRType, type NewPR } from "@/lib/pr-types";

export * from "@/lib/pr-types";

type CandidateSet = {
  id: string;
  weightKg: unknown;
  reps: number;
  estimated1RM: unknown;
  completedAt: Date | null;
};

type Best = { value: number; setId: string; achievedAt: Date };

function bestBy(sets: CandidateSet[], selector: (s: CandidateSet) => number): Best {
  let bestSet = sets[0];
  let bestValue = selector(sets[0]);
  for (const s of sets.slice(1)) {
    const v = selector(s);
    if (v > bestValue) {
      bestValue = v;
      bestSet = s;
    }
  }
  return {
    value: bestValue,
    setId: bestSet.id,
    achievedAt: bestSet.completedAt ?? new Date(),
  };
}

/**
 * Recomputes the four PR types (max weight, max reps, max estimated 1RM, and
 * best single-set volume) for one (user, exercise) from its current
 * non-warmup sets, and writes the results to the PersonalRecord cache.
 * Scoped to a single exercise's sets — bounded and cheap — rather than a
 * live aggregate over the whole table. Called after every set write, edit,
 * or delete, since any of those can change what the true best is (not just
 * increase it). Returns the PR types that are new or improved compared to
 * what was cached before this call, so callers can surface a "new PR" toast.
 */
export async function recomputeExercisePRs(
  userId: string,
  exerciseId: string
): Promise<NewPR[]> {
  const [sets, existing] = await Promise.all([
    db.setEntry.findMany({
      where: {
        userId,
        exerciseId,
        isWarmup: false,
        isDropSet: false,
        isCompleted: true,
      },
      select: {
        id: true,
        weightKg: true,
        reps: true,
        estimated1RM: true,
        completedAt: true,
      },
    }),
    db.personalRecord.findMany({
      where: { userId, exerciseId },
      select: { type: true, value: true },
    }),
  ]);
  const existingByType = new Map(existing.map((e) => [e.type, Number(e.value)]));

  if (sets.length === 0) {
    await db.personalRecord.deleteMany({ where: { userId, exerciseId } });
    return [];
  }

  const best: Record<PRType, Best> = {
    MAX_WEIGHT: bestBy(sets, (s) => Number(s.weightKg)),
    MAX_REPS: bestBy(sets, (s) => s.reps),
    MAX_E1RM: bestBy(sets, (s) =>
      s.estimated1RM != null
        ? Number(s.estimated1RM)
        : estimatedOneRepMax(Number(s.weightKg), s.reps)
    ),
    MAX_VOLUME: bestBy(sets, (s) => Number(s.weightKg) * s.reps),
  };

  await db.$transaction(
    PR_TYPES.map((type) =>
      db.personalRecord.upsert({
        where: { userId_exerciseId_type: { userId, exerciseId, type } },
        create: {
          userId,
          exerciseId,
          type,
          value: best[type].value,
          setEntryId: best[type].setId,
          achievedAt: best[type].achievedAt,
        },
        update: {
          value: best[type].value,
          setEntryId: best[type].setId,
          achievedAt: best[type].achievedAt,
        },
      })
    )
  );

  const newPRs: NewPR[] = [];
  for (const type of PR_TYPES) {
    const prevValue = existingByType.get(type);
    if (prevValue == null || best[type].value > prevValue) {
      newPRs.push({ type, value: best[type].value });
    }
  }
  return newPRs;
}
