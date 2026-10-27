import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserExportData } from "@/lib/export";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data = await getUserExportData(session.user.id);
  const filename = `iron-log-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
