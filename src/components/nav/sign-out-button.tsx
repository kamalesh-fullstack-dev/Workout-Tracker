"use client";

import { useRef, useState, useTransition, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type LaunchRect = { top: number; left: number; width: number; height: number };

const FLIGHT_MS = 600;
const EASE_IN = "cubic-bezier(0.55, 0, 1, 0.45)";

function plateStyle(side: "left" | "right", unloading: boolean): CSSProperties {
  const dx = side === "left" ? -46 : 46;
  const rotate = side === "left" ? -100 : 100;
  return {
    transformBox: "view-box",
    transformOrigin: side === "left" ? "12px 16px" : "60px 16px",
    transform: unloading
      ? `translate(${dx}px, 36px) rotate(${rotate}deg) scale(0.6)`
      : "translate(0px, 0px) rotate(0deg) scale(1)",
    opacity: unloading ? 0 : 1,
    transition: `transform ${FLIGHT_MS}ms ${EASE_IN}, opacity ${FLIGHT_MS}ms ${EASE_IN}`,
  };
}

function BarbellIcon({
  className,
  unloading = false,
}: {
  className?: string;
  unloading?: boolean;
}) {
  const left = plateStyle("left", unloading);
  const right = plateStyle("right", unloading);
  return (
    <svg viewBox="0 0 72 32" className={className} fill="none" aria-hidden>
      <rect x="22" y="13" width="28" height="6" rx="1.5" className="fill-foreground" />
      <g style={left}>
        <rect x="2" y="2" width="12" height="28" rx="3" className="fill-primary" />
        <rect x="14" y="9" width="8" height="14" rx="2" className="fill-primary" opacity={0.85} />
      </g>
      <g style={right}>
        <rect x="50" y="9" width="8" height="14" rx="2" className="fill-primary" opacity={0.85} />
        <rect x="58" y="2" width="12" height="28" rx="3" className="fill-primary" />
      </g>
    </svg>
  );
}

export function SignOutButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [launch, setLaunch] = useState<LaunchRect | null>(null);
  const [unloading, setUnloading] = useState(false);
  const [, startTransition] = useTransition();

  function handleClick() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      startTransition(async () => {
        await signOutAction();
      });
      return;
    }
    setLaunch({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setUnloading(true));
    });
    setTimeout(() => {
      startTransition(async () => {
        await signOutAction();
      });
    }, FLIGHT_MS);
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              ref={buttonRef}
              type="button"
              variant="ghost"
              size="icon-lg"
              disabled={!!launch}
              onClick={handleClick}
              aria-label="Sign out"
              style={{ opacity: launch ? 0 : 1, transition: "opacity 150ms" }}
              className="size-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <BarbellIcon className="size-9" />
            </Button>
          }
        />
        <TooltipContent>Sign out</TooltipContent>
      </Tooltip>

      {launch &&
        createPortal(
          <div
            aria-hidden
            className="pointer-events-none fixed z-50"
            style={{ top: launch.top, left: launch.left, width: launch.width, height: launch.height }}
          >
            <BarbellIcon
              className="absolute top-1/2 left-1/2 w-20 -translate-x-1/2 -translate-y-1/2"
              unloading={unloading}
            />
          </div>,
          document.body
        )}
    </>
  );
}
