import { db } from "@/lib/db";

/** "YYYY-MM-DD" for today, UTC-based — same convention used for body metrics. */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Consecutive *completed* clean days, ending yesterday — today is still in
 * progress (you could still log a cheat meal before it's over), so it only
 * joins the count once it's actually finished and was clean. The walk back
 * stops at mealTrackingStartedAt — the first time this user ever saw the
 * meal tracker, set lazily here on first call — not account creation,
 * since days before the feature existed were never actually tracked and
 * shouldn't inflate the streak.
 */
export async function getCleanStreak(userId: string): Promise<number> {
  let user = await db.user.findUnique({
    where: { id: userId },
    select: { mealTrackingStartedAt: true },
  });

  if (!user?.mealTrackingStartedAt) {
    user = await db.user.update({
      where: { id: userId },
      data: { mealTrackingStartedAt: new Date() },
      select: { mealTrackingStartedAt: true },
    });
  }

  const cheatMeals = await db.cheatMeal.findMany({
    where: { userId },
    select: { date: true },
    distinct: ["date"],
  });

  const cheatDates = new Set(
    cheatMeals.map((m) => m.date.toISOString().slice(0, 10))
  );
  const trackingStart = user.mealTrackingStartedAt!.toISOString().slice(0, 10);

  let streak = 0;
  const cursor = new Date();
  cursor.setUTCDate(cursor.getUTCDate() - 1); // start from yesterday, not today
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (key < trackingStart || cheatDates.has(key)) break;
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
