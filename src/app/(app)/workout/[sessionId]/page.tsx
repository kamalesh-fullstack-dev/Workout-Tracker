import { notFound } from "next/navigation";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { fetchSuggestionForExercise } from "@/actions/workouts";
import { getLastSessionSets } from "@/lib/progress";
import { ActiveWorkout } from "@/components/workout/active-workout";
import { DeleteWorkoutButton } from "@/components/workout/delete-workout-button";
import { SaveAsRoutineButton } from "@/components/workout/save-as-routine-button";
import { Badge } from "@/components/ui/badge";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requireUser();
  const { sessionId } = await params;

  const session = await db.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: { select: { name: true } },
          sets: { orderBy: { setNumber: "asc" } },
        },
      },
    },
  });

  if (!session || session.userId !== user.id) {
    notFound();
  }

  const isCompleted = !!session.completedAt;

  const baseExercises = session.exercises.map((se) => ({
    id: se.id,
    exerciseId: se.exerciseId,
    exerciseName: se.exercise.name,
    restSeconds: se.restSeconds,
    sets: se.sets.map((s) => ({
      id: s.id,
      setNumber: s.setNumber,
      weightKg: Number(s.weightKg),
      reps: s.reps,
      rpe: s.rpe ? Number(s.rpe) : null,
      isWarmup: s.isWarmup,
    })),
  }));

  // Prefetch a suggestion for every exercise that has no sets logged yet
  // this session, so the active screen opens with fields already prefilled.
  // Not needed once a workout is finished — editing existing history doesn't
  // need a "what should I lift next" hint.
  const routineTargetsByExerciseId = new Map<
    string,
    { reps: number | null; weightKg: number | null }
  >();
  if (!isCompleted && session.routineId) {
    const routine = await db.routineTemplate.findUnique({
      where: { id: session.routineId },
      include: { exercises: { include: { targetSets: true } } },
    });
    for (const re of routine?.exercises ?? []) {
      const firstTarget = re.targetSets[0];
      if (firstTarget) {
        routineTargetsByExerciseId.set(re.exerciseId, {
          reps: firstTarget.targetReps,
          weightKg: firstTarget.targetWeightKg
            ? Number(firstTarget.targetWeightKg)
            : null,
        });
      }
    }
  }

  const exercises = await Promise.all(
    baseExercises.map(async (exercise) => {
      const lastSessionSets = await getLastSessionSets(
        user.id,
        exercise.exerciseId
      ).catch((err) => {
        console.error("Failed to fetch last session sets for", exercise.exerciseId, err);
        return [];
      });

      if (exercise.sets.length > 0) {
        return { ...exercise, suggestion: null, lastSessionSets };
      }

      try {
        const suggestion = await fetchSuggestionForExercise(
          user.id,
          exercise.exerciseId,
          routineTargetsByExerciseId.get(exercise.exerciseId)
        );
        return { ...exercise, suggestion, lastSessionSets };
      } catch (err) {
        console.error("Failed to compute suggestion for", exercise.exerciseId, err);
        return { ...exercise, suggestion: null, lastSessionSets };
      }
    })
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {isCompleted ? "Workout summary" : "Workout in progress"}
          </h1>
          {isCompleted && (
            <p className="text-muted-foreground text-sm">
              {new Date(session.startedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && <Badge variant="secondary">Finished</Badge>}
          {session.exercises.length > 0 && (
            <SaveAsRoutineButton
              sessionId={session.id}
              defaultName={
                session.name ??
                `Workout ${new Date(session.startedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}`
              }
            />
          )}
          <DeleteWorkoutButton sessionId={session.id} />
        </div>
      </div>
      <ActiveWorkout
        sessionId={session.id}
        initialExercises={exercises}
        isCompleted={isCompleted}
      />
    </div>
  );
}
