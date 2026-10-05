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
import {
  EQUIPMENT_LABELS,
  EQUIPMENT_TYPES,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUPS,
} from "@/lib/validations/exercise";

const ANY = "ANY";

export function ExerciseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ANY) {
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
        placeholder="Search exercises..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="sm:max-w-xs"
      />
      <div className="flex flex-wrap gap-2">
        <Select
          value={searchParams.get("muscle") ?? ANY}
          onValueChange={(value) => updateParam("muscle", value as string)}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Muscle group">
              {(value: string) =>
                value === ANY
                  ? "All muscle groups"
                  : MUSCLE_GROUP_LABELS[value as keyof typeof MUSCLE_GROUP_LABELS]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All muscle groups</SelectItem>
            {MUSCLE_GROUPS.map((group) => (
              <SelectItem key={group} value={group}>
                {MUSCLE_GROUP_LABELS[group]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("equipment") ?? ANY}
          onValueChange={(value) => updateParam("equipment", value as string)}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Equipment">
              {(value: string) =>
                value === ANY
                  ? "All equipment"
                  : EQUIPMENT_LABELS[value as keyof typeof EQUIPMENT_LABELS]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All equipment</SelectItem>
            {EQUIPMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {EQUIPMENT_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
