import Link from "next/link";
import { Dumbbell, Flame, Trophy } from "lucide-react";
import { auth } from "@/lib/auth";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { formatHistoryDate, formatDuration } from "@/lib/dates";
import { PR_TYPE_LABELS, type PRType } from "@/lib/pr-types";
import { getCleanStreak, todayISO } from "@/lib/meals";
import { getHabitsWithStreaks } from "@/lib/habits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MealSlotToggles } from "@/components/meals/meal-slot-toggles";
import { HabitList } from "@/components/habits/habit-list";

function formatPRValue(type: PRType, value: number) {
  return type === "MAX_REPS" ? `${value} reps` : `${value} kg`;
}

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

  const recentPRs = await db.personalRecord.findMany({
    where: { userId: user.id },
    orderBy: { achievedAt: "desc" },
    take: 3,
    include: { exercise: { select: { name: true } } },
  });

  const today = todayISO();
  const [streak, todayCheatMeals, habits] = await Promise.all([
    getCleanStreak(user.id),
    db.cheatMeal.findMany({
      where: { userId: user.id, date: new Date(today) },
      select: { slot: true, note: true },
    }),
    getHabitsWithStreaks(user.id),
  ]);

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
            nativeButton={false}
            render={
              <Link href={`/workout/${inProgressSession.id}`}>
                <Dumbbell />
                Resume workout
              </Link>
            }
          />
        </Card>
      ) : (
        <Button
          size="lg"
          className="h-12 w-full"
          nativeButton={false}
          render={
            <Link href="/workout/start">
              <Dumbbell />
              Start workout
            </Link>
          }
        />
      )}

      <Card className="gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="text-primary size-5 shrink-0" />
            <span className="font-heading text-lg">
              {streak} day{streak === 1 ? "" : "s"}
            </span>
            <span className="text-muted-foreground text-sm">clean</span>
          </div>
          <Link
            href="/meals"
            className="text-muted-foreground text-xs underline underline-offset-4"
          >
            View log
          </Link>
        </div>
        <MealSlotToggles date={today} cheatMeals={todayCheatMeals} />
      </Card>

      <Card className="gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium">Habit Tracker</h2>
          <Link
            href="/habits"
            className="text-muted-foreground text-xs underline underline-offset-4"
          >
            View all
          </Link>
        </div>
        <HabitList habits={habits} />
      </Card>

      {recentPRs.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Recent PRs</h2>
            <Link href="/prs" className="text-muted-foreground text-xs underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentPRs.map((pr) => (
              <Card key={pr.id} className="flex-row items-center gap-3 p-3">
                <Trophy className="text-primary size-4 shrink-0" />
                <div className="flex-1 text-sm">
                  <span className="font-medium">{pr.exercise.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {PR_TYPE_LABELS[pr.type as PRType]}:{" "}
                    {formatPRValue(pr.type as PRType, Number(pr.value))}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
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
                      {formatHistoryDate(s.startedAt)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {s.exercises.length} exercises
                      {s.completedAt &&
                        ` · ${formatDuration(s.startedAt, s.completedAt)}`}
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
