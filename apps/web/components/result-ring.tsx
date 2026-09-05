import { cn } from "@/lib/utils";

export function ResultRing({
  value,
  loading,
  className,
  size = 150
}: {
  value: number;
  loading?: boolean;
  className?: string;
  size?: number;
}) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, value));
  const offset = circumference * (1 - progress);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("ring-glow transition-all", loading && "spin-slow")}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#bgGrad)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={loading ? 0 : offset}
          className={cn(loading && "dash")}
          style={loading ? undefined : { transition: "stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
          {loading ? "..." : `${Math.round(value * 100)}%`}
        </span>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
          Resemblance
        </span>
      </div>
    </div>
  );
}
