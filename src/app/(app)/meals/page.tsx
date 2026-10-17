import { Flame } from "lucide-react";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { getCleanStreak, todayISO } from "@/lib/meals";
import { Card } from "@/components/ui/card";
import { MealSlotToggles } from "@/components/meals/meal-slot-toggles";
import { CheatMealLog } from "@/components/meals/cheat-meal-log";

export default async function MealsPage() {
  const user = await requireUser();
  const today = todayISO();

  const [streak, todayCheatMeals, allEntries] = await Promise.all([
    getCleanStreak(user.id),
    db.cheatMeal.findMany({
      where: { userId: user.id, date: new Date(today) },
      select: { slot: true, note: true },
    }),
    db.cheatMeal.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      select: { id: true, date: true, slot: true, note: true },
    }),
  ]);

  const logEntries = allEntries.map((e) => ({
    id: e.id,
    date: e.date.toISOString(),
    slot: e.slot,
    note: e.note,
  }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Meals</h1>

      <Card className="gap-3 p-4">
        <div className="flex items-center gap-2">
          <Flame className="text-primary size-6 shrink-0" />
          <span className="font-heading text-2xl">
            {streak} day{streak === 1 ? "" : "s"}
          </span>
          <span className="text-muted-foreground text-sm">clean streak</span>
        </div>
        <p className="text-muted-foreground text-xs">
          Tap a meal below if it was a cheat meal. One cheat meal makes the
          whole day a cheat day — today only joins the streak once it&apos;s
          over. Pick an earlier date if you forgot to log one on the day it
          happened.
        </p>
        <MealSlotToggles date={today} cheatMeals={todayCheatMeals} showDatePicker />
      </Card>

      <div className="flex flex-col gap-2">
        <h2 className="text-muted-foreground text-sm font-medium">
          Cheat meal log
        </h2>
        <CheatMealLog entries={logEntries} />
      </div>
    </div>
  );
}
