import { requireUser } from "@/actions/auth";
import { db } from "@/lib/db";
import { BodyWeightSection } from "@/components/body-metrics/body-weight-section";
import { MeasurementsSection } from "@/components/body-metrics/measurements-section";

export default async function BodyMetricsPage() {
  const user = await requireUser();

  const [weightEntries, measurements] = await Promise.all([
    db.bodyMetricEntry.findMany({
      where: { userId: user.id, weightKg: { not: null } },
      orderBy: { date: "desc" },
      take: 90,
    }),
    db.bodyMeasurement.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">Body metrics</h1>

      <BodyWeightSection
        entries={weightEntries.map((e) => ({
          id: e.id,
          date: e.date.toISOString(),
          weightKg: Number(e.weightKg),
        }))}
      />

      <MeasurementsSection
        entries={measurements.map((m) => ({
          id: m.id,
          date: m.date.toISOString(),
          type: m.type,
          valueCm: Number(m.valueCm),
        }))}
      />
    </div>
  );
}
