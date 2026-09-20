import { auth } from "@/lib/auth";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/nav/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-border bg-card/70 sticky top-0 z-20 flex flex-col gap-3 border-b px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold tracking-tight">Iron Log</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {session?.user?.email}
            </span>
            <ThemeToggle />
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <MainNav />
      </header>
      <main className="flex flex-1 flex-col px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
