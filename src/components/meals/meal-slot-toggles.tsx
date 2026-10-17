"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "cn";
import {
  toggleCheatMealAction,
  getCheatMealsForDateAction,
  setCheatMealNoteAction,
} from "@/actions/meals";
import { MEAL_SLOTS, MEAL_SLOT_LABELS } from "@/lib/validations/meals";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Slot = (typeof MEAL_SLOTS)[number];
type CheatMealEntry = { slot: Slot; note: string | null };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MealSlotToggles({
  date: initialDate,
  cheatMeals: initialCheatMeals,
  showDatePicker = false,
}: {
  date: string;
  cheatMeals: CheatMealEntry[];
  showDatePicker?: boolean;
}) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [cheatMeals, setCheatMeals] = useState(
    () => new Map(initialCheatMeals.map((m) => [m.slot, m.note ?? ""]))
  );
  const [isLoadingDate, startLoadTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [pendingSlot, setPendingSlot] = useState<Slot | null>(null);
  const [pendingNote, setPendingNote] = useState("");

  function handleDateChange(newDate: string) {
    setDate(newDate);
    startLoadTransition(async () => {
      const entries = await getCheatMealsForDateAction(newDate);
      setCheatMeals(new Map(entries.map((e) => [e.slot, e.note ?? ""])));
    });
  }

  function openSlot(slot: Slot) {
    setPendingSlot(slot);
    setPendingNote(cheatMeals.get(slot) ?? "");
  }

  const isEditingExisting = pendingSlot !== null && cheatMeals.has(pendingSlot);

  function confirmLog() {
    if (!pendingSlot) return;
    const slot = pendingSlot;
    const note = pendingNote.trim();

    startSaveTransition(async () => {
      if (isEditingExisting) {
        const result = await setCheatMealNoteAction({ date, slot, note });
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
      } else {
        const result = await toggleCheatMealAction({ date, slot });
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        if (note) {
          await setCheatMealNoteAction({ date, slot, note });
        }
      }
      setCheatMeals((prev) => new Map(prev).set(slot, note));
      setPendingSlot(null);
      router.refresh();
    });
  }

  function removePending() {
    if (!pendingSlot) return;
    const slot = pendingSlot;

    startSaveTransition(async () => {
      const result = await toggleCheatMealAction({ date, slot });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setCheatMeals((prev) => {
        const next = new Map(prev);
        next.delete(slot);
        return next;
      });
      setPendingSlot(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {showDatePicker && (
        <div className="flex items-center gap-2">
          <Label htmlFor="meal-log-date" className="text-muted-foreground text-xs">
            Date
          </Label>
          <input
            id="meal-log-date"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => handleDateChange(e.target.value)}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          />
        </div>
      )}
      <div
        className="grid grid-cols-4 gap-2"
        style={{ opacity: isLoadingDate ? 0.6 : 1 }}
      >
        {MEAL_SLOTS.map((slot) => {
          const isCheat = cheatMeals.has(slot);
          return (
            <button
              key={slot}
              type="button"
              disabled={isLoadingDate}
              onClick={() => openSlot(slot)}
              className={cn(
                "rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors disabled:opacity-60",
                isCheat
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border hover:bg-muted"
              )}
            >
              {MEAL_SLOT_LABELS[slot]}
            </button>
          );
        })}
      </div>

      <Dialog
        open={pendingSlot !== null}
        onOpenChange={(open) => !open && setPendingSlot(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {isEditingExisting ? "Edit" : "Log"} cheat meal
              {pendingSlot ? ` — ${MEAL_SLOT_LABELS[pendingSlot]}` : ""}
            </DialogTitle>
            <DialogDescription>
              {isEditingExisting
                ? "Update what you ate, or remove this cheat meal."
                : "This marks the whole day as a cheat day."}
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="What did you eat? (optional)"
            value={pendingNote}
            onChange={(e) => setPendingNote(e.target.value)}
          />
          <DialogFooter className="sm:flex-row">
            {isEditingExisting && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isSaving}
                onClick={removePending}
              >
                Remove
              </Button>
            )}
            <Button
              type="button"
              className="flex-1"
              disabled={isSaving}
              onClick={confirmLog}
            >
              {isSaving ? "Saving..." : isEditingExisting ? "Save" : "Confirm log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
