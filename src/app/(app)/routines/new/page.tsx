import { RoutineBuilder } from "@/components/routines/routine-builder";
import { BackLink } from "@/components/nav/back-link";

export default function NewRoutinePage() {
  return (
    <div>
      <BackLink href="/routines" />
      <h1 className="mb-4 text-xl font-semibold tracking-tight">
        New routine
      </h1>
      <RoutineBuilder />
    </div>
  );
}
