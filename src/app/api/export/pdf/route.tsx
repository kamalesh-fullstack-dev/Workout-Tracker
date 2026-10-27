import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { getUserExportData } from "@/lib/export";
import { ExportReport } from "@/components/pdf/export-report";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Not authenticated", { status: 401 });
  }

  const data = await getUserExportData(session.user.id);
  const buffer = await renderToBuffer(<ExportReport data={data} />);
  const filename = `iron-log-export-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
