import { notFound } from "next/navigation";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { ActiveWorkout } from "@/components/workout/active-workout";
import { Card } from "@/components/ui/card";
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

  const exercises = session.exercises.map((se) => ({
    id: se.id,
    exerciseId: se.exerciseId,
    exerciseName: se.exercise.name,
    sets: se.sets.map((s) => ({
      id: s.id,
      setNumber: s.setNumber,
      weightKg: Number(s.weightKg),
      reps: s.reps,
      rpe: s.rpe ? Number(s.rpe) : null,
      isWarmup: s.isWarmup,
    })),
  }));

  if (session.completedAt) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            Workout summary
          </h1>
          <Badge variant="secondary">Finished</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {new Date(session.startedAt).toLocaleString()}
        </p>
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="gap-2 p-4">
            <h3 className="font-medium">{exercise.exerciseName}</h3>
            <div className="flex flex-col gap-1">
              {exercise.sets.map((set) => (
                <div
                  key={set.id}
                  className="text-muted-foreground flex items-center gap-3 text-sm"
                >
                  <span className="w-6 font-mono">{set.setNumber}</span>
                  <span>
                    {set.weightKg} kg × {set.reps}
                    {set.rpe ? ` @ RPE ${set.rpe}` : ""}
                    {set.isWarmup ? " (warmup)" : ""}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold tracking-tight">
        Workout in progress
      </h1>
      <ActiveWorkout sessionId={session.id} initialExercises={exercises} />
    </div>
  );
}
