import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ExerciseFilters } from "@/components/exercises/exercise-filters";
import { ExerciseList } from "@/components/exercises/exercise-list";
import type {
  EQUIPMENT_TYPES,
  MUSCLE_GROUPS,
} from "@/lib/validations/exercise";

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; muscle?: string; equipment?: string }>;
}) {
  const user = await requireUser();
  const { q, muscle, equipment } = await searchParams;

  const where: Prisma.ExerciseWhereInput = {
    OR: [{ isCustom: false }, { createdById: user.id }],
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(muscle
      ? { muscleGroups: { has: muscle as (typeof MUSCLE_GROUPS)[number] } }
      : {}),
    ...(equipment
      ? { equipment: equipment as (typeof EQUIPMENT_TYPES)[number] }
      : {}),
  };

  const exercises = await db.exercise.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      equipment: true,
      muscleGroups: true,
      isCustom: true,
      createdById: true,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Exercises</h1>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/exercises/new">Add custom</Link>}
        />
      </div>
      <ExerciseFilters />
      <ExerciseList exercises={exercises} currentUserId={user.id} />
    </div>
  );
}
