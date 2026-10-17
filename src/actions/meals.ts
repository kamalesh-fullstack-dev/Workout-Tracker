"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import {
  toggleCheatMealSchema,
  setCheatMealNoteSchema,
  type ToggleCheatMealInput,
  type SetCheatMealNoteInput,
} from "@/lib/validations/meals";

type ActionResult = { error: string } | { success: true };
type ToggleResult = { error: string } | { success: true; cheated: boolean };

/** Marks a meal slot as a cheat if it wasn't, or un-marks it if it already was. */
export async function toggleCheatMealAction(
  input: ToggleCheatMealInput
): Promise<ToggleResult> {
  const user = await requireUser();

  const parsed = toggleCheatMealSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const date = new Date(parsed.data.date);
  const { slot } = parsed.data;

  const existing = await db.cheatMeal.findUnique({
    where: { userId_date_slot: { userId: user.id, date, slot } },
    select: { id: true },
  });

  if (existing) {
    await db.cheatMeal.delete({ where: { id: existing.id } });
    revalidatePath("/meals");
    revalidatePath("/dashboard");
    return { success: true, cheated: false };
  }

  await db.cheatMeal.create({ data: { userId: user.id, date, slot } });
  revalidatePath("/meals");
  revalidatePath("/dashboard");
  return { success: true, cheated: true };
}

/** Cheat meals already logged for an arbitrary date — used when the picker on /meals changes date. */
export async function getCheatMealsForDateAction(date: string) {
  const user = await requireUser();

  return db.cheatMeal.findMany({
    where: { userId: user.id, date: new Date(date) },
    select: { slot: true, note: true },
  });
}

/** Sets or clears the note on a slot already marked as a cheat meal. */
export async function setCheatMealNoteAction(
  input: SetCheatMealNoteInput
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = setCheatMealNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const date = new Date(parsed.data.date);
  const { slot } = parsed.data;

  const result = await db.cheatMeal.updateMany({
    where: { userId: user.id, date, slot },
    data: { note: parsed.data.note || null },
  });
  if (result.count === 0) {
    return { error: "Mark it as a cheat meal first." };
  }

  revalidatePath("/meals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCheatMealAction(id: string): Promise<ActionResult> {
  const user = await requireUser();

  const entry = await db.cheatMeal.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!entry || entry.userId !== user.id) {
    return { error: "Entry not found." };
  }

  await db.cheatMeal.delete({ where: { id } });
  revalidatePath("/meals");
  revalidatePath("/dashboard");
  return { success: true };
}
