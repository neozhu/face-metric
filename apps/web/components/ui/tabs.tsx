import * as React from "react";
import { cn } from "@/lib/utils";

type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
};

export function Tabs({ value, onValueChange, options, className }: TabsProps) {
  return (
    <div className={cn("inline-flex rounded-md border border-border bg-card/50 p-1", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          onClick={() => onValueChange(opt.value)}
          className={cn(
            "px-3 py-1.5 text-xs rounded-sm transition-colors",
            value === opt.value ? "bg-border text-white" : "text-slate-400 hover:text-white",
            opt.disabled && "opacity-40 cursor-not-allowed"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

