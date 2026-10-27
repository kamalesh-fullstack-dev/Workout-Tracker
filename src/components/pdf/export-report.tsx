import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PR_TYPE_LABELS, type PRType } from "@/lib/pr-types";
import type { UserExportData } from "@/lib/export";

const MAX_SESSIONS_IN_PDF = 60;

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666666", marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingVertical: 4,
    fontWeight: 700,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#dddddd",
    paddingVertical: 4,
  },
  cell: { flex: 1 },
  cellWide: { flex: 2 },
  muted: { color: "#888888", fontSize: 9 },
  sessionBlock: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eeeeee",
  },
  sessionTitle: { fontWeight: 700, marginBottom: 2 },
  exerciseLine: { marginTop: 2 },
  routineLine: { marginBottom: 3 },
});

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ExportReport({ data }: { data: UserExportData }) {
  const sortedSessions = [...data.workoutSessions].reverse();
  const recentSessions = sortedSessions.slice(0, MAX_SESSIONS_IN_PDF);
  const omittedCount = data.workoutSessions.length - recentSessions.length;
  const latestBodyMetric = data.bodyMetrics[data.bodyMetrics.length - 1];

  return (
    <Document title="Iron Log Export" author={data.user.name ?? data.user.email}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Iron Log — Data Export</Text>
        <Text style={styles.subtitle}>
          {(data.user.name ?? data.user.email) + " · " + data.user.email}
          {"  ·  Exported " + new Date(data.exportedAt).toLocaleString()}
        </Text>

        <Text style={styles.sectionTitle}>Personal Records</Text>
        {data.personalRecords.length === 0 ? (
          <Text style={styles.muted}>No personal records yet.</Text>
        ) : (
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.cellWide}>Exercise</Text>
              <Text style={styles.cell}>Type</Text>
              <Text style={styles.cell}>Value</Text>
              <Text style={styles.cell}>Date</Text>
            </View>
            {data.personalRecords.map((pr, i) => (
              <View style={styles.row} key={i}>
                <Text style={styles.cellWide}>{pr.exerciseName}</Text>
                <Text style={styles.cell}>{PR_TYPE_LABELS[pr.type as PRType]}</Text>
                <Text style={styles.cell}>{pr.value}</Text>
                <Text style={styles.cell}>{fmtDate(pr.achievedAt)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Body Metrics ({data.bodyMetrics.length} entries)
        </Text>
        {latestBodyMetric ? (
          <Text style={styles.muted}>
            Latest: {latestBodyMetric.weightKg ?? "—"} kg on {fmtDate(latestBodyMetric.date)}
          </Text>
        ) : (
          <Text style={styles.muted}>No body metrics logged.</Text>
        )}

        <Text style={styles.sectionTitle}>Routines ({data.routines.length})</Text>
        {data.routines.length === 0 ? (
          <Text style={styles.muted}>No routines saved.</Text>
        ) : (
          data.routines.map((r, i) => (
            <Text key={i} style={styles.routineLine}>
              {r.name} — {r.exercises.map((e) => e.exerciseName).join(", ") || "no exercises"}
            </Text>
          ))
        )}
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>
          Workout History ({recentSessions.length}
          {omittedCount > 0 ? ` of ${data.workoutSessions.length}` : ""})
        </Text>
        {omittedCount > 0 && (
          <Text style={styles.muted}>
            Showing the {recentSessions.length} most recent sessions. The JSON export has the
            complete history.
          </Text>
        )}
        {recentSessions.length === 0 ? (
          <Text style={styles.muted}>No workouts logged yet.</Text>
        ) : (
          recentSessions.map((session, i) => (
            <View key={i} style={styles.sessionBlock} wrap={false}>
              <Text style={styles.sessionTitle}>
                {fmtDate(session.startedAt)}
                {session.name ? ` — ${session.name}` : ""}
              </Text>
              {session.exercises.map((ex, j) => (
                <Text key={j} style={styles.exerciseLine}>
                  {ex.exerciseName}:{" "}
                  {ex.sets.map((s) => `${s.weightKg}kg×${s.reps}`).join(", ") || "no sets logged"}
                </Text>
              ))}
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}
