import { describe, expect, it } from "vitest";
import { getSuggestion, type SetHistoryEntry } from "@/lib/suggestions";

function daysAgo(n: number): Date {
  const d = new Date("2026-01-30T12:00:00Z");
  d.setDate(d.getDate() - n);
  return d;
}

function set(
  overrides: Partial<SetHistoryEntry> & { sessionExerciseId: string }
): SetHistoryEntry {
  return {
    weightKg: 60,
    reps: 8,
    rpe: null,
    isWarmup: false,
    completedAt: daysAgo(0),
    ...overrides,
  };
}

describe("getSuggestion", () => {
  it("has no history and no routine target -> prompts for a starting weight", () => {
    const result = getSuggestion([], { equipment: "BARBELL" });
    expect(result.source).toBe("none");
    expect(result.suggestedWeightKg).toBeNull();
    expect(result.suggestedReps).toBeNull();
  });

  it("has no history but a routine target -> suggests the planned weight/reps", () => {
    const result = getSuggestion([], {
      equipment: "BARBELL",
      routineTarget: { reps: 5, weightKg: 100 },
    });
    expect(result.source).toBe("routine");
    expect(result.suggestedWeightKg).toBe(100);
    expect(result.suggestedReps).toBe(5);
  });

  it("hit all reps last time with no high RPE -> suggests a weight increase (barbell increment)", () => {
    const history: SetHistoryEntry[] = [
      set({ sessionExerciseId: "s1", weightKg: 60, reps: 8, completedAt: daysAgo(7) }),
      set({ sessionExerciseId: "s1", weightKg: 60, reps: 8, completedAt: daysAgo(7) }),
      set({ sessionExerciseId: "s1", weightKg: 60, reps: 8, completedAt: daysAgo(7) }),
    ];
    const result = getSuggestion(history, { equipment: "BARBELL" });
    expect(result.source).toBe("history");
    expect(result.suggestedWeightKg).toBe(62.5);
    expect(result.suggestedReps).toBe(8);
  });

  it("hit reps on a bodyweight exercise (no increment) -> suggests one more rep instead", () => {
    const history: SetHistoryEntry[] = [
      set({ sessionExerciseId: "s1", weightKg: 0, reps: 12, completedAt: daysAgo(3) }),
    ];
    const result = getSuggestion(history, { equipment: "BODYWEIGHT" });
    expect(result.suggestedWeightKg).toBe(0);
    expect(result.suggestedReps).toBe(13);
  });

  it("last top set was near failure (RPE >= 9) -> holds the same weight/reps", () => {
    const history: SetHistoryEntry[] = [
      set({ sessionExerciseId: "s1", weightKg: 100, reps: 5, rpe: 9.5, completedAt: daysAgo(2) }),
    ];
    const result = getSuggestion(history, { equipment: "BARBELL" });
    expect(result.suggestedWeightKg).toBe(100);
    expect(result.suggestedReps).toBe(5);
    expect(result.rationale).toMatch(/near failure/i);
  });

  it("missed reps in a single session (big drop-off) -> repeats the same weight once", () => {
    const history: SetHistoryEntry[] = [
      set({ sessionExerciseId: "s1", weightKg: 80, reps: 8, completedAt: daysAgo(4) }),
      set({ sessionExerciseId: "s1", weightKg: 80, reps: 4, completedAt: daysAgo(4) }),
    ];
    const result = getSuggestion(history, { equipment: "BARBELL" });
    expect(result.source).toBe("history");
    expect(result.suggestedWeightKg).toBe(80);
    expect(result.suggestedReps).toBe(8);
  });

  it("missed the same weight two sessions in a row -> suggests a ~10% deload", () => {
    const history: SetHistoryEntry[] = [
      // Most recent session: missed at 80kg
      set({ sessionExerciseId: "s2", weightKg: 80, reps: 8, completedAt: daysAgo(1) }),
      set({ sessionExerciseId: "s2", weightKg: 80, reps: 4, completedAt: daysAgo(1) }),
      // Previous session: also missed at 80kg
      set({ sessionExerciseId: "s1", weightKg: 80, reps: 8, completedAt: daysAgo(8) }),
      set({ sessionExerciseId: "s1", weightKg: 80, reps: 3, completedAt: daysAgo(8) }),
    ];
    const result = getSuggestion(history, { equipment: "BARBELL" });
    expect(result.source).toBe("deload");
    // 80 * 0.9 = 72, rounded to nearest 2.5kg increment -> 72.5
    expect(result.suggestedWeightKg).toBe(72.5);
  });

  it("flags wouldBePR when the suggested performance beats historical best e1RM", () => {
    const history: SetHistoryEntry[] = [
      set({ sessionExerciseId: "s1", weightKg: 60, reps: 8, completedAt: daysAgo(7) }),
    ];
    const result = getSuggestion(history, { equipment: "BARBELL" });
    // suggestion: 62.5kg x 8 reps, e1RM ~= 79.17, vs previous best e1RM ~= 76 -> should be a PR
    expect(result.wouldBePR).toBe(true);
  });

  it("does not flag wouldBePR when holding at a near-failure weight already at best e1RM", () => {
    const history: SetHistoryEntry[] = [
      set({ sessionExerciseId: "s1", weightKg: 100, reps: 5, rpe: 9.5, completedAt: daysAgo(2) }),
    ];
    const result = getSuggestion(history, { equipment: "BARBELL" });
    expect(result.wouldBePR).toBe(false);
  });

  it("ignores warmup sets when determining the reference set", () => {
    const history: SetHistoryEntry[] = [
      set({ sessionExerciseId: "s1", weightKg: 20, reps: 10, isWarmup: true, completedAt: daysAgo(3) }),
      set({ sessionExerciseId: "s1", weightKg: 60, reps: 8, completedAt: daysAgo(3) }),
    ];
    const result = getSuggestion(history, { equipment: "BARBELL" });
    expect(result.suggestedWeightKg).toBe(62.5);
  });
});
