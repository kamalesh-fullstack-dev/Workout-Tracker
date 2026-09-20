"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import {
  logBodyWeightSchema,
  logMeasurementSchema,
  type LogBodyWeightInput,
  type LogMeasurementInput,
} from "@/lib/validations/body-metrics";

type ActionResult = { error: string } | { success: true };

export async function logBodyWeightAction(
  input: LogBodyWeightInput
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = logBodyWeightSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid entry." };
  }

  const date = new Date(parsed.data.date);

  await db.bodyMetricEntry.upsert({
    where: { userId_date: { userId: user.id, date } },
    create: {
      userId: user.id,
      date,
      weightKg: parsed.data.weightKg,
      note: parsed.data.note,
    },
    update: {
      weightKg: parsed.data.weightKg,
      note: parsed.data.note,
    },
  });

  revalidatePath("/body-metrics");
  return { success: true };
}

export async function deleteBodyWeightAction(
  id: string
): Promise<ActionResult> {
  const user = await requireUser();

  const entry = await db.bodyMetricEntry.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!entry || entry.userId !== user.id) {
    return { error: "Entry not found." };
  }

  await db.bodyMetricEntry.delete({ where: { id } });
  revalidatePath("/body-metrics");
  return { success: true };
}

export async function logMeasurementAction(
  input: LogMeasurementInput
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = logMeasurementSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid entry." };
  }

  await db.bodyMeasurement.create({
    data: {
      userId: user.id,
      date: new Date(parsed.data.date),
      type: parsed.data.type,
      valueCm: parsed.data.valueCm,
    },
  });

  revalidatePath("/body-metrics");
  return { success: true };
}

export async function deleteMeasurementAction(
  id: string
): Promise<ActionResult> {
  const user = await requireUser();

  const entry = await db.bodyMeasurement.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!entry || entry.userId !== user.id) {
    return { error: "Entry not found." };
  }

  await db.bodyMeasurement.delete({ where: { id } });
  revalidatePath("/body-metrics");
  return { success: true };
}
