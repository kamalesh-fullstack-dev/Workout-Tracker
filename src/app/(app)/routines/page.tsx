import Link from "next/link";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { RoutineList } from "@/components/routines/routine-list";

export default async function RoutinesPage() {
  const user = await requireUser();

  const routines = await db.routineTemplate.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      exercises: {
        select: { exercise: { select: { name: true } } },
      },
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Routines</h1>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/routines/new">New routine</Link>}
        />
      </div>

      {routines.length === 0 && (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No routines yet. Create one to speed up starting your workouts.
        </p>
      )}

      <RoutineList
        routines={routines.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          exerciseNames: r.exercises.map((e) => e.exercise.name),
        }))}
      />
    </div>
  );
}
