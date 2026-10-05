import { Flag } from "lucide-react";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/nav/main-nav";
import { MobileTabBar } from "@/components/nav/mobile-tab-bar";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="header-stripe bg-card/70 sticky top-0 z-20 flex flex-col gap-3 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading text-primary flex items-center gap-1.5 text-lg tracking-tight">
            <Flag className="size-4" />
            Iron Log
          </span>
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
      <main className="flex flex-1 flex-col px-4 py-6 pb-24 sm:px-6 sm:pb-6">
        {children}
      </main>
      <MobileTabBar />
    </div>
  );
}
