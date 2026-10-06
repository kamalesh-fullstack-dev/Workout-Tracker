"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { updateSessionTimesAction } from "@/actions/workouts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Local "YYYY-MM-DDTHH:mm" for a <input type="datetime-local"> value. */
function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EditSessionTimesButton({
  sessionId,
  startedAt,
  completedAt,
}: {
  sessionId: string;
  startedAt: string;
  completedAt: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(() => toLocalInputValue(new Date(startedAt)));
  const [finish, setFinish] = useState(() =>
    completedAt ? toLocalInputValue(new Date(completedAt)) : ""
  );
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!start) {
      toast.error("Set a start time.");
      return;
    }
    startTransition(async () => {
      const result = await updateSessionTimesAction({
        sessionId,
        startedAt: new Date(start),
        completedAt: finish ? new Date(finish) : null,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Times updated");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Edit workout times">
            <Clock />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit workout times</DialogTitle>
          <DialogDescription>
            Fix the start or finish time — handy if you forgot to tap
            &quot;Finish workout&quot; and only noticed later.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="session-start">Started</Label>
            <input
              id="session-start"
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="session-finish">
              Finished (leave blank if still in progress)
            </Label>
            <input
              id="session-finish"
              type="datetime-local"
              value={finish}
              onChange={(e) => setFinish(e.target.value)}
              className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
