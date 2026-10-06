import { notFound } from "next/navigation";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { ExerciseForm } from "@/components/exercises/exercise-form";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const user = await requireUser();
  const { exerciseId } = await params;

  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise || !exercise.isCustom || exercise.createdById !== user.id) {
    notFound();
  }

  return (
    <ExerciseForm
      mode="edit"
      exerciseId={exercise.id}
      defaultValues={{
        name: exercise.name,
        category: exercise.category,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        trackingType: exercise.trackingType,
      }}
    />
  );
}
