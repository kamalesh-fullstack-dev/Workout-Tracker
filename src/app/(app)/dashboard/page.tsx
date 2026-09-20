import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold tracking-tight">
        Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="text-muted-foreground text-sm">
        Your workout dashboard, PRs, and suggestions will show up here once
        the exercise library and logging phases are built.
      </p>
    </div>
  );
}
