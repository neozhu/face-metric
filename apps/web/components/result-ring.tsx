import { cn } from "@/lib/utils";

export function ResultRing({
  value,
  loading,
  className
}: {
  value: number;
  loading?: boolean;
  className?: string;
}) {
  const size = 160;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, value));
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className={cn("ring-glow", loading && "spin-slow", className)}>
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
        style={loading ? undefined : { transition: "stroke-dashoffset 600ms ease" }}
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
  );
}
