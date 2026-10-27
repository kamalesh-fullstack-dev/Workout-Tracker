import { FileJson, FileText } from "lucide-react";
import { requireUser } from "@/actions/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/nav/back-link";

export default async function SettingsPage() {
  await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <BackLink href="/dashboard" />
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Export your data</CardTitle>
          <CardDescription>
            Download everything you&apos;ve logged — workouts, routines, PRs,
            body metrics — so you always have your own copy, whatever happens
            to the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full justify-start"
            nativeButton={false}
            render={<a href="/api/export/json" download />}
          >
            <FileJson />
            Download full backup (JSON)
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start"
            nativeButton={false}
            render={<a href="/api/export/pdf" download />}
          >
            <FileText />
            Download readable report (PDF)
          </Button>
          <p className="text-muted-foreground mt-1 text-xs">
            The JSON file has your complete history and is meant for
            migrating elsewhere or keeping a raw backup. The PDF is a
            readable summary — PRs, routines, and your most recent workouts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
