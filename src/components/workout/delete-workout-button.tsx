"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteWorkoutSessionAction } from "@/actions/workouts";
import { Button } from "@/components/ui/button";

export function DeleteWorkoutButton({
  sessionId,
  redirectTo = "/history",
}: {
  sessionId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this workout? This can't be undone.")) return;

    startTransition(async () => {
      const result = await deleteWorkoutSessionAction(sessionId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Workout deleted");
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      onClick={handleDelete}
      aria-label="Delete workout"
    >
      <Trash2 />
    </Button>
  );
}
