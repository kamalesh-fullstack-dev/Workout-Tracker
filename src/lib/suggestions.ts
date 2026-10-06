import {
  EQUIPMENT_INCREMENT_KG,
  estimatedOneRepMax,
  roundToIncrement,
  type Equipment,
} from "@/lib/units";

export type SetHistoryEntry = {
  sessionExerciseId: string;
  weightKg: number;
  reps: number;
  rpe: number | null;
  isWarmup: boolean;
  isDropSet?: boolean;
  completedAt: Date;
};

export type RoutineTargetHint = {
  reps: number | null;
  weightKg: number | null;
};

export type SuggestionSource = "none" | "routine" | "history" | "deload";

export type Suggestion = {
  suggestedWeightKg: number | null;
  suggestedReps: number | null;
  rationale: string;
  source: SuggestionSource;
  wouldBePR: boolean;
};

const REP_DROP_THRESHOLD = 2;
const HIGH_RPE_THRESHOLD = 9;
const DELOAD_FACTOR = 0.9;

/**
 * Groups working sets by session (sessionExerciseId), most recent session first.
 * Assumes `sets` is already sorted by completedAt descending.
 */
function groupBySession(sets: SetHistoryEntry[]): SetHistoryEntry[][] {
  const order: string[] = [];
  const groups = new Map<string, SetHistoryEntry[]>();
  for (const set of sets) {
    if (!groups.has(set.sessionExerciseId)) {
      groups.set(set.sessionExerciseId, []);
      order.push(set.sessionExerciseId);
    }
    groups.get(set.sessionExerciseId)!.push(set);
  }
  return order.map((id) => groups.get(id)!);
}

/** The heaviest set in a session (tie-broken by higher reps) — treated as the "working weight". */
function referenceSetOf(session: SetHistoryEntry[]): SetHistoryEntry {
  return session.reduce((best, set) =>
    set.weightKg > best.weightKg ||
    (set.weightKg === best.weightKg && set.reps > best.reps)
      ? set
      : best
  );
}

type SessionStatus = "hit" | "near_failure" | "missed";

function statusOf(session: SetHistoryEntry[], reference: SetHistoryEntry): SessionStatus {
  if (reference.rpe != null && reference.rpe >= HIGH_RPE_THRESHOLD) {
    return "near_failure";
  }
  const setsAtReferenceWeight = session.filter(
    (s) => s.weightKg === reference.weightKg
  );
  const minReps = Math.min(...setsAtReferenceWeight.map((s) => s.reps));
  if (reference.reps - minReps >= REP_DROP_THRESHOLD) {
    return "missed";
  }
  return "hit";
}

/**
 * Suggests the next weight/reps for an exercise based on training history.
 * Pure and side-effect free — `history` should be every non-current-session
 * set for this (user, exercise), most recent first is not required (it is
 * sorted internally), but every entry must include a real `completedAt`.
 */
export function getSuggestion(
  history: SetHistoryEntry[],
  options: { equipment: Equipment; routineTarget?: RoutineTargetHint }
): Suggestion {
  const workingSets = history
    .filter((s) => !s.isWarmup && !s.isDropSet)
    .slice()
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

  const bestE1RM = workingSets.reduce(
    (max, s) => Math.max(max, estimatedOneRepMax(s.weightKg, s.reps)),
    0
  );

  if (workingSets.length === 0) {
    if (options.routineTarget?.weightKg != null || options.routineTarget?.reps != null) {
      return {
        suggestedWeightKg: options.routineTarget.weightKg ?? null,
        suggestedReps: options.routineTarget.reps ?? null,
        rationale: "Planned from your routine.",
        source: "routine",
        wouldBePR: false,
      };
    }
    return {
      suggestedWeightKg: null,
      suggestedReps: null,
      rationale: "No history yet — log a starting weight and reps.",
      source: "none",
      wouldBePR: false,
    };
  }

  const increment = EQUIPMENT_INCREMENT_KG[options.equipment];
  const sessions = groupBySession(workingSets);
  const lastSession = sessions[0];
  const reference = referenceSetOf(lastSession);
  const status = statusOf(lastSession, reference);

  let result: Suggestion;

  if (status === "hit") {
    const nextWeight =
      increment > 0
        ? roundToIncrement(reference.weightKg + increment, increment)
        : reference.weightKg;
    const nextReps = increment > 0 ? reference.reps : reference.reps + 1;
    result = {
      suggestedWeightKg: nextWeight,
      suggestedReps: nextReps,
      rationale:
        increment > 0
          ? `You hit ${reference.reps} reps at ${reference.weightKg}kg last time — try adding a little weight.`
          : `You hit ${reference.reps} reps last time — try one more rep.`,
      source: "history",
      wouldBePR: false,
    };
  } else if (status === "near_failure") {
    result = {
      suggestedWeightKg: reference.weightKg,
      suggestedReps: reference.reps,
      rationale: `Your last set was near failure (RPE ${reference.rpe}) — repeat this weight before increasing.`,
      source: "history",
      wouldBePR: false,
    };
  } else {
    const previousSession = sessions[1];
    let consecutiveMisses = 1;
    if (previousSession) {
      const prevReference = referenceSetOf(previousSession);
      if (
        prevReference.weightKg === reference.weightKg &&
        statusOf(previousSession, prevReference) === "missed"
      ) {
        consecutiveMisses = 2;
      }
    }

    if (consecutiveMisses >= 2) {
      const deloadWeight =
        increment > 0
          ? roundToIncrement(reference.weightKg * DELOAD_FACTOR, increment)
          : reference.weightKg;
      result = {
        suggestedWeightKg: deloadWeight,
        suggestedReps: reference.reps,
        rationale: `You've missed this weight two sessions in a row — try a deload to ${deloadWeight}kg.`,
        source: "deload",
        wouldBePR: false,
      };
    } else {
      result = {
        suggestedWeightKg: reference.weightKg,
        suggestedReps: reference.reps,
        rationale: `You missed a rep or two last time — repeat ${reference.weightKg}kg before progressing.`,
        source: "history",
        wouldBePR: false,
      };
    }
  }

  if (result.suggestedWeightKg != null && result.suggestedReps != null) {
    const suggestedE1RM = estimatedOneRepMax(
      result.suggestedWeightKg,
      result.suggestedReps
    );
    result.wouldBePR = suggestedE1RM > bestE1RM;
  }

  return result;
}
