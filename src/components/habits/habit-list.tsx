"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Flame, Plus, Trash2 } from "lucide-react";
import { cn } from "cn";
import {
  createHabitAction,
  deleteHabitAction,
  toggleHabitSlipAction,
} from "@/actions/habits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type HabitItem = {
  id: string;
  name: string;
  streak: number;
  slippedToday: boolean;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function HabitRow({ habit }: { habit: HabitItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleHabitSlipAction({
        habitId: habit.id,
        date: todayISO(),
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteHabitAction(habit.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Habit removed");
      router.refresh();
    });
  }

  return (
    <Card className="flex-row items-center gap-3 p-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Flame
          className={cn(
            "size-5 shrink-0",
            habit.streak > 0 ? "text-primary" : "text-muted-foreground"
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{habit.name}</p>
          <p className="text-muted-foreground text-xs">
            {habit.streak} day{habit.streak === 1 ? "" : "s"} clean
          </p>
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        variant={habit.slippedToday ? "destructive" : "outline"}
        disabled={isPending}
        onClick={handleToggle}
      >
        {habit.slippedToday ? "Slipped today" : "I slipped today"}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${habit.name}`}
            />
          }
        >
          <Trash2 />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove &quot;{habit.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes its whole streak history. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export function HabitList({ habits }: { habits: HabitItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await createHabitAction({ name: trimmed });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setName("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {habits.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No habits yet — add one below to start tracking a streak.
        </p>
      ) : (
        habits.map((habit) => <HabitRow key={habit.id} habit={habit} />)
      )}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="e.g. No smoking, No junk food..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || !name.trim()}>
          <Plus />
          Add
        </Button>
      </form>
    </div>
  );
}
