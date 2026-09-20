import Link from "next/link";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteWorkoutButton } from "@/components/workout/delete-workout-button";

export default async function HistoryPage() {
  const user = await requireUser();

  const sessions = await db.workoutSession.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    orderBy: { startedAt: "desc" },
    include: {
      exercises: {
        select: {
          exercise: { select: { name: true } },
          sets: { select: { weightKg: true, reps: true } },
        },
      },
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">History</h1>

      {sessions.length === 0 && (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No finished workouts yet.{" "}
          <Link href="/workout/start" className="text-foreground underline underline-offset-4">
            Start one
          </Link>
          .
        </p>
      )}

      <div className="flex flex-col gap-3">
        {sessions.map((session) => {
          const setCount = session.exercises.reduce(
            (sum, e) => sum + e.sets.length,
            0
          );
          const volumeKg = session.exercises.reduce(
            (sum, e) =>
              sum +
              e.sets.reduce(
                (setSum, s) => setSum + Number(s.weightKg) * s.reps,
                0
              ),
            0
          );

          return (
            <Card key={session.id} className="gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/workout/${session.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {new Date(session.startedAt).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <Badge variant="outline">
                      {session.exercises.length} exercise
                      {session.exercises.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {session.exercises.map((e) => e.exercise.name).join(", ")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {setCount} sets · {Math.round(volumeKg).toLocaleString()} kg volume
                  </p>
                </Link>
                <DeleteWorkoutButton sessionId={session.id} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
