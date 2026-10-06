import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackLink({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <Button
      variant="outline"
      size="xs"
      className="border-primary/50 text-primary hover:bg-primary/10 mb-3 w-fit self-start rounded-full"
      nativeButton={false}
      render={<Link href={href} />}
    >
      <ChevronLeft className="size-3.5" />
      {label}
    </Button>
  );
}
