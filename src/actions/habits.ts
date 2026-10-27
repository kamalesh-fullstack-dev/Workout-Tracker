"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import {
  createHabitSchema,
  toggleHabitSlipSchema,
  type CreateHabitInput,
  type ToggleHabitSlipInput,
} from "@/lib/validations/habits";

type ActionResult = { error: string } | { success: true };
type ToggleResult = { error: string } | { success: true; slipped: boolean };

export async function createHabitAction(
  input: CreateHabitInput
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = createHabitSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await db.habit.create({
    data: { userId: user.id, name: parsed.data.name },
  });
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Marks today (or a given date) as a slip for this habit, or un-marks it if it already was. */
export async function toggleHabitSlipAction(
  input: ToggleHabitSlipInput
): Promise<ToggleResult> {
  const user = await requireUser();

  const parsed = toggleHabitSlipSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const habit = await db.habit.findUnique({
    where: { id: parsed.data.habitId },
    select: { userId: true },
  });
  if (!habit || habit.userId !== user.id) {
    return { error: "Habit not found." };
  }

  const date = new Date(parsed.data.date);
  const existing = await db.habitSlip.findUnique({
    where: { habitId_date: { habitId: parsed.data.habitId, date } },
    select: { id: true },
  });

  if (existing) {
    await db.habitSlip.delete({ where: { id: existing.id } });
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    return { success: true, slipped: false };
  }

  await db.habitSlip.create({
    data: { habitId: parsed.data.habitId, userId: user.id, date },
  });
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { success: true, slipped: true };
}

export async function deleteHabitAction(habitId: string): Promise<ActionResult> {
  const user = await requireUser();

  const habit = await db.habit.findUnique({
    where: { id: habitId },
    select: { userId: true },
  });
  if (!habit || habit.userId !== user.id) {
    return { error: "Habit not found." };
  }

  await db.habit.delete({ where: { id: habitId } });
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { success: true };
}
