import { db } from "@/lib/db";
import { todayISO } from "@/lib/dates";

export type HabitWithStreak = {
  id: string;
  name: string;
  streak: number;
  slippedToday: boolean;
};

/**
 * Every habit this user is tracking, with its clean streak computed —
 * consecutive days with no slip, ending yesterday (today is still in
 * progress). Bounded by the habit's own createdAt, not a shared tracking
 * start, since each habit begins its own streak the moment it's created.
 */
export async function getHabitsWithStreaks(
  userId: string
): Promise<HabitWithStreak[]> {
  const habits = await db.habit.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      slips: { select: { date: true } },
    },
  });

  const todayKey = todayISO();

  return habits.map((habit) => {
    const slipDates = new Set(
      habit.slips.map((s) => s.date.toISOString().slice(0, 10))
    );
    const trackingStart = habit.createdAt.toISOString().slice(0, 10);

    let streak = 0;
    const cursor = new Date();
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    for (;;) {
      const key = cursor.toISOString().slice(0, 10);
      if (key < trackingStart || slipDates.has(key)) break;
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return {
      id: habit.id,
      name: habit.name,
      streak,
      slippedToday: slipDates.has(todayKey),
    };
  });
}
