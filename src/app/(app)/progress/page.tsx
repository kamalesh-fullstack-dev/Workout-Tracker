import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { getExerciseProgressData } from "@/lib/progress";
import { ProgressExplorer } from "@/components/charts/progress-explorer";

export default async function ProgressPage() {
  const user = await requireUser();

  const trainedExerciseIds = await db.setEntry.findMany({
    where: { userId: user.id, isWarmup: false, isCompleted: true },
    select: { exerciseId: true },
    distinct: ["exerciseId"],
  });

  if (trainedExerciseIds.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Progress</h1>
        <p className="text-muted-foreground py-12 text-center text-sm">
          Log a few workouts and your progress charts will show up here.
        </p>
      </div>
    );
  }

  const exercises = await db.exercise.findMany({
    where: { id: { in: trainedExerciseIds.map((e) => e.exerciseId) } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const initialData = await getExerciseProgressData(user.id, exercises[0].id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">Progress</h1>
      <ProgressExplorer exercises={exercises} initialData={initialData} />
    </div>
  );
}
