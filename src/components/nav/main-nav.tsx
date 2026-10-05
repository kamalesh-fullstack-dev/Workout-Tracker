"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/routines", label: "Routines" },
  { href: "/history", label: "History" },
  { href: "/prs", label: "PRs" },
  { href: "/progress", label: "Progress" },
  { href: "/exercises", label: "Exercises" },
  { href: "/body-metrics", label: "Body" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 overflow-x-auto sm:flex">
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-muted text-foreground after:absolute after:inset-x-2.5 after:-bottom-1.5 after:h-0.5 after:rounded-full after:bg-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
