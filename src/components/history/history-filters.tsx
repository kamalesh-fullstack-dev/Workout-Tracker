"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RANGE_OPTIONS: [value: string, label: string][] = [
  ["7", "Last 7 days"],
  ["30", "Last 30 days"],
  ["90", "Last 3 months"],
  ["365", "Last year"],
  ["all", "All time"],
];
const RANGE_LABELS = Object.fromEntries(RANGE_OPTIONS);

export function HistoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(
    key: string,
    value: string,
    { deleteIfEmpty = true }: { deleteIfEmpty?: boolean } = {}
  ) {
    const params = new URLSearchParams(searchParams.toString());
    if (deleteIfEmpty && !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query !== (searchParams.get("q") ?? "")) {
        updateParam("q", query);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Search by exercise..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="sm:max-w-xs"
      />
      <Select
        value={searchParams.get("range") ?? "7"}
        onValueChange={(value) =>
          updateParam("range", value as string, { deleteIfEmpty: false })
        }
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Date range">
            {(value: string) => RANGE_LABELS[value]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
