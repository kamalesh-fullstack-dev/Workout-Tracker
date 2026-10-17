"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { deleteCheatMealAction } from "@/actions/meals";
import { MEAL_SLOT_LABELS, type MEAL_SLOTS } from "@/lib/validations/meals";
import { formatHistoryDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LogEntry = {
  id: string;
  date: string;
  slot: (typeof MEAL_SLOTS)[number];
  note: string | null;
};

export function CheatMealLog({ entries }: { entries: LogEntry[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const byDate = new Map<string, LogEntry[]>();
  for (const entry of entries) {
    const list = byDate.get(entry.date) ?? [];
    list.push(entry);
    byDate.set(entry.date, list);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteCheatMealAction(id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (byDate.size === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No cheat meals logged — keep the streak going.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {Array.from(byDate.entries()).map(([date, dayEntries]) => (
        <Card key={date} className="flex-row items-center gap-3 p-3">
          <div className="flex-1 text-sm">
            <span className="font-medium">{formatHistoryDate(date)}</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {dayEntries.map((entry) => (
                <Badge
                  key={entry.id}
                  variant="outline"
                  className="border-destructive/50 text-destructive gap-1 pr-1"
                >
                  {MEAL_SLOT_LABELS[entry.slot]}
                  {entry.note && (
                    <span className="text-destructive/80 font-normal">
                      — {entry.note}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={isPending}
                    onClick={() => handleDelete(entry.id)}
                    aria-label={`Remove ${MEAL_SLOT_LABELS[entry.slot]} on ${formatHistoryDate(date)}`}
                    className="size-4"
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
