import Link from "next/link";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { startWorkoutAction } from "@/actions/workouts";
import { startWorkoutFromRoutineAction } from "@/actions/routines";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function StartWorkoutPage() {
  const user = await requireUser();

  const routines = await db.routineTemplate.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { exercises: { select: { exercise: { select: { name: true } } } } },
  });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4">
      {routines.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-muted-foreground text-sm font-medium">
            Start from a routine
          </h2>
          {routines.map((routine) => (
            <Card key={routine.id} className="gap-2 p-4">
              <p className="font-medium">{routine.name}</p>
              <p className="text-muted-foreground text-xs">
                {routine.exercises.map((e) => e.exercise.name).join(", ")}
              </p>
              <form action={startWorkoutFromRoutineAction.bind(null, routine.id)}>
                <Button type="submit" size="sm" className="mt-1 w-full">
                  Start {routine.name}
                </Button>
              </form>
            </Card>
          ))}
          <Link
            href="/routines/new"
            className="text-muted-foreground text-center text-sm underline underline-offset-4"
          >
            Create another routine
          </Link>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Start a blank workout</CardTitle>
          <CardDescription>
            {routines.length > 0
              ? "Or skip the plan and add exercises as you go."
              : "No routines yet — start blank and add exercises as you go, or build a routine first."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <form action={startWorkoutAction}>
            <Button type="submit" size="lg" className="w-full">
              Start empty workout
            </Button>
          </form>
          {routines.length === 0 && (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              nativeButton={false}
              render={<Link href="/routines/new">Build a routine</Link>}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
