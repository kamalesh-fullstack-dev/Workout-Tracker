"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  History,
  Trophy,
  TrendingUp,
  Dumbbell,
  Ruler,
} from "lucide-react";
import { cn } from "cn";

const TAB_LINKS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/routines", label: "Routines", icon: ClipboardList },
  { href: "/history", label: "History", icon: History },
  { href: "/prs", label: "PRs", icon: Trophy },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/body-metrics", label: "Body", icon: Ruler },
];

export function MobileTabBar() {
  const pathname = usePathname();

  // The active workout screen has its own fixed bottom action bar and rest
  // timer — a second fixed bar here would overlap it, so stay out of the way.
  if (pathname.startsWith("/workout/")) {
    return null;
  }

  return (
    <nav
      className="bg-card/90 border-border fixed inset-x-0 bottom-0 z-20 flex items-stretch justify-between border-t px-1 shadow-2xl backdrop-blur-xl sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TAB_LINKS.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
