"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type RestTimerHandle = {
  start: (seconds: number) => void;
};

function playChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.18);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.3);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    // ignore — audio isn't critical
  }
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const RestTimer = forwardRef<RestTimerHandle>(function RestTimer(
  _props,
  ref
) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const chimedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    start(seconds: number) {
      chimedRef.current = false;
      setTotal(seconds);
      setSecondsLeft(seconds);
    },
  }));

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      if (!chimedRef.current) {
        chimedRef.current = true;
        playChime();
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification("Rest complete", { body: "Time for your next set." });
        }
      }
      return;
    }
    const id = setTimeout(() => {
      setSecondsLeft((s) => (s !== null ? s - 1 : null));
    }, 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  useEffect(() => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  if (secondsLeft === null) return null;

  const isDone = secondsLeft <= 0;
  const progress = total > 0 ? Math.max(0, secondsLeft / total) : 0;

  return (
    <div className="bg-card/90 border-border fixed inset-x-0 bottom-20 z-30 mx-auto w-fit rounded-full border px-3 py-2 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div
          className="relative flex size-10 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--primary) ${progress * 360}deg, var(--muted) 0deg)`,
          }}
        >
          <div className="bg-card flex size-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums">
            {formatTime(Math.max(0, secondsLeft))}
          </div>
        </div>
        <span className="text-sm font-medium">
          {isDone ? "Rest complete" : "Resting..."}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setSecondsLeft((s) => (s ?? 0) + 15)}
          aria-label="Add 15 seconds"
        >
          <Plus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setSecondsLeft(null)}
          aria-label="Dismiss timer"
        >
          <X />
        </Button>
      </div>
    </div>
  );
});
