export const PR_TYPES = ["MAX_WEIGHT", "MAX_REPS", "MAX_E1RM", "MAX_VOLUME"] as const;
export type PRType = (typeof PR_TYPES)[number];

export const PR_TYPE_LABELS: Record<PRType, string> = {
  MAX_WEIGHT: "Max weight",
  MAX_REPS: "Max reps",
  MAX_E1RM: "Estimated 1RM",
  MAX_VOLUME: "Best set volume",
};

export type NewPR = { type: PRType; value: number };
