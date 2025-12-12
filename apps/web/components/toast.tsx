"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Toast({
  message,
  variant = "error",
  durationMs = 2600,
  onDone
}: {
  message: string | null;
  variant?: "error" | "info";
  durationMs?: number;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!message) {
      setOpen(false);
      return;
    }
    setOpen(true);
    const t = setTimeout(() => {
      setOpen(false);
      onDone?.();
    }, durationMs);
    return () => clearTimeout(t);
  }, [message, durationMs, onDone]);

  if (!message) return null;

  return (
    <div
      className={cn(
        "fixed right-4 top-4 z-50 min-w-56 max-w-sm rounded-lg border px-3 py-2 text-sm shadow-lg backdrop-blur transition-all",
        open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
        variant === "error"
          ? "border-red-500/40 bg-red-500/10 text-red-200"
          : "border-border bg-card/80 text-slate-200"
      )}
    >
      {message}
    </div>
  );
}

