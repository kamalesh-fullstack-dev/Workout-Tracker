import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { getExerciseProgressData } from "@/lib/progress";
import { ProgressExplorer } from "@/components/charts/progress-explorer";

export default async function ProgressPage() {
  const user = await requireUser();

  const sets = await db.setEntry.findMany({
    where: { userId: user.id, isWarmup: false, isCompleted: true },
    select: {
      exerciseId: true,
      sessionExercise: {
        select: {
          exercise: { select: { name: true } },
          workoutSessionId: true,
        },
      },
    },
  });

  if (sets.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Progress</h1>
        <p className="text-muted-foreground py-12 text-center text-sm">
          Log a few workouts and your progress charts will show up here.
        </p>
      </div>
    );
  }

  const byExercise = new Map<string, { name: string; sessionIds: Set<string> }>();
  for (const s of sets) {
    const entry = byExercise.get(s.exerciseId) ?? {
      name: s.sessionExercise.exercise.name,
      sessionIds: new Set<string>(),
    };
    entry.sessionIds.add(s.sessionExercise.workoutSessionId);
    byExercise.set(s.exerciseId, entry);
  }

  const exercises = Array.from(byExercise.entries())
    .map(([id, v]) => ({ id, name: v.name, sessionCount: v.sessionIds.size }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Default to whichever exercise has the most logged sessions, not just the
  // alphabetically first one — otherwise landing on a single-session exercise
  // shows "log a couple more sessions" even when plenty of other exercises
  // already have a real trend to show.
  const defaultExercise = exercises.reduce((best, e) =>
    e.sessionCount > best.sessionCount ? e : best
  );

  const initialData = await getExerciseProgressData(user.id, defaultExercise.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">Progress</h1>
      <ProgressExplorer
        exercises={exercises}
        initialExerciseId={defaultExercise.id}
        initialData={initialData}
      />
    </div>
  );
}
