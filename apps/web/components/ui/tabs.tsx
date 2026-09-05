import * as React from "react";
import { cn } from "@/lib/utils";

type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: React.ReactNode; disabled?: boolean }[];
};

export function Tabs({ value, onValueChange, options, className }: TabsProps) {
  return (
    <div className={cn("flex w-full rounded-lg border border-border/80 bg-slate-950/60 p-1 gap-1", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          onClick={() => onValueChange(opt.value)}
          className={cn(
            "flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 select-none",
            value === opt.value
              ? "bg-slate-800/90 text-white shadow-sm border border-slate-700/60"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40",
            opt.disabled && "opacity-40 cursor-not-allowed"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

