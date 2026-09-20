import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  const user = await requireUser();

  const inProgressSession = await db.workoutSession.findFirst({
    where: { userId: user.id, completedAt: null },
    orderBy: { startedAt: "desc" },
    select: { id: true, startedAt: true },
  });

  const recentSessions = await db.workoutSession.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    orderBy: { startedAt: "desc" },
    take: 5,
    include: {
      exercises: { select: { exercise: { select: { name: true } } } },
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">
          Ready to train? Start a workout and log your sets as you go.
        </p>
      </div>

      {inProgressSession ? (
        <Card className="gap-2 p-4">
          <p className="text-sm font-medium">Workout in progress</p>
          <p className="text-muted-foreground text-sm">
            Started {new Date(inProgressSession.startedAt).toLocaleString()}
          </p>
          <Button
            size="lg"
            className="mt-2 w-full"
            render={
              <Link href={`/workout/${inProgressSession.id}`}>
                Resume workout
              </Link>
            }
          />
        </Card>
      ) : (
        <Button
          size="lg"
          className="h-12 w-full"
          render={<Link href="/workout/start">Start workout</Link>}
        />
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Recent workouts</h2>
        {recentSessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nothing logged yet — your finished workouts will show up here.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentSessions.map((s) => (
              <Link key={s.id} href={`/workout/${s.id}`}>
                <Card className="gap-1 p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {new Date(s.startedAt).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {s.exercises.length} exercises
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
