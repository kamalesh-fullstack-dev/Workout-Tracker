import Link from "next/link";
import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { PR_TYPES, PR_TYPE_LABELS, type PRType } from "@/lib/pr-types";
import { Card } from "@/components/ui/card";
import { PRSearch } from "@/components/prs/pr-search";
import { Trophy } from "lucide-react";

function formatPRValue(type: PRType, value: number) {
  if (type === "MAX_REPS") return `${value} reps`;
  return `${value} kg`;
}

function relativeDate(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export default async function PRsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;

  const records = await db.personalRecord.findMany({
    where: {
      userId: user.id,
      ...(q ? { exercise: { name: { contains: q, mode: "insensitive" } } } : {}),
    },
    include: { exercise: { select: { id: true, name: true } } },
    orderBy: { achievedAt: "desc" },
  });

  const hasAnyPRs = q
    ? (await db.personalRecord.count({ where: { userId: user.id } })) > 0
    : records.length > 0;

  if (!hasAnyPRs) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h1 className="text-xl font-semibold tracking-tight">PRs</h1>
        <p className="text-muted-foreground py-12 text-center text-sm">
          No PRs yet. Log some working sets and your personal records will
          show up here.{" "}
          <Link href="/workout/start" className="text-foreground underline underline-offset-4">
            Start a workout
          </Link>
          .
        </p>
      </div>
    );
  }

  const recent = records.slice(0, 5);

  const byExercise = new Map<
    string,
    { name: string; records: Map<PRType, (typeof records)[number]> }
  >();
  for (const record of records) {
    if (!byExercise.has(record.exerciseId)) {
      byExercise.set(record.exerciseId, {
        name: record.exercise.name,
        records: new Map(),
      });
    }
    byExercise.get(record.exerciseId)!.records.set(record.type, record);
  }
  const exerciseGroups = Array.from(byExercise.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">PRs</h1>
      <PRSearch />

      {records.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No PRs match &quot;{q}&quot;.
        </p>
      ) : (
        <>
          {!q && (
            <div className="flex flex-col gap-2">
              <h2 className="text-muted-foreground text-sm font-medium">
                Recently achieved
              </h2>
              <div className="flex flex-col gap-2">
                {recent.map((record) => (
                  <Card key={record.id} className="flex-row items-center gap-3 p-3">
                    <Trophy className="text-primary size-4 shrink-0" />
                    <div className="flex-1 text-sm">
                      <span className="font-medium">{record.exercise.name}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {PR_TYPE_LABELS[record.type as PRType]}:{" "}
                        {formatPRValue(record.type as PRType, Number(record.value))}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {relativeDate(record.achievedAt)}
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h2 className="text-muted-foreground text-sm font-medium">
              {q ? "Matching exercises" : "All personal records"}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {exerciseGroups.map((group) => (
                <Card key={group.name} className="gap-2 p-4">
                  <h3 className="font-medium">{group.name}</h3>
                  <div className="flex flex-col gap-1">
                    {PR_TYPES.map((type) => {
                      const record = group.records.get(type);
                      if (!record) return null;
                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {PR_TYPE_LABELS[type]}
                          </span>
                          <span className="font-medium">
                            {formatPRValue(type, Number(record.value))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
