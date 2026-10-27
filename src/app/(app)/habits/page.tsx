import { requireUser } from "@/actions/auth";
import { getHabitsWithStreaks } from "@/lib/habits";
import { HabitList } from "@/components/habits/habit-list";

export default async function HabitsPage() {
  const user = await requireUser();
  const habits = await getHabitsWithStreaks(user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Habit Tracker</h1>
        <p className="text-muted-foreground text-sm">
          Track anything you&apos;re trying to stop — a clean streak for each
          one, separate from your meals.
        </p>
      </div>

      <HabitList habits={habits} />
    </div>
  );
}
