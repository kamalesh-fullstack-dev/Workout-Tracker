import { notFound } from "next/navigation";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { RoutineBuilder } from "@/components/routines/routine-builder";

export default async function EditRoutinePage({
  params,
}: {
  params: Promise<{ routineId: string }>;
}) {
  const user = await requireUser();
  const { routineId } = await params;

  const routine = await db.routineTemplate.findUnique({
    where: { id: routineId },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: { select: { name: true } },
          targetSets: { orderBy: { setNumber: "asc" } },
        },
      },
    },
  });

  if (!routine || routine.userId !== user.id) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold tracking-tight">
        Edit routine
      </h1>
      <RoutineBuilder
        routineId={routine.id}
        initialName={routine.name}
        initialDescription={routine.description ?? ""}
        initialExercises={routine.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exercise.name,
          restSeconds: ex.restSeconds,
          targetSets: ex.targetSets.map((s) => ({
            targetReps: s.targetReps,
            targetWeightKg: s.targetWeightKg ? Number(s.targetWeightKg) : null,
          })),
        }))}
      />
    </div>
  );
}
