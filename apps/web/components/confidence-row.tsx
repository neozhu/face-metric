import { Cpu, ShieldCheck, Ruler, Sparkles } from "lucide-react";

export function ConfidenceRow({
  confidence,
  model,
  distance,
  hint
}: {
  confidence: number;
  model: string;
  distance?: number;
  hint?: string;
}) {
  return (
    <div className="w-full space-y-3">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
        <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/60 border border-border/80 flex flex-col justify-between">
          <div className="text-slate-400 flex items-center gap-1.5 text-[11px] sm:text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Confidence</span>
          </div>
          <div className="font-semibold text-slate-100 text-base sm:text-lg mt-1 font-mono">
            {(confidence * 100).toFixed(0)}%
          </div>
        </div>

        {distance !== undefined ? (
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/60 border border-border/80 flex flex-col justify-between">
            <div className="text-slate-400 flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Ruler className="h-3.5 w-3.5 text-teal-400" />
              <span>Distance</span>
            </div>
            <div className="font-semibold text-slate-100 text-base sm:text-lg mt-1 font-mono">
              {distance.toFixed(3)}
            </div>
          </div>
        ) : null}

        <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-3 rounded-lg bg-slate-900/60 border border-border/80 flex flex-col justify-between">
          <div className="text-slate-400 flex items-center gap-1.5 text-[11px] sm:text-xs">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>Models</span>
          </div>
          <div className="font-medium text-slate-200 text-xs sm:text-sm mt-1 truncate" title={model}>
            {model || "ArcFace"}
          </div>
        </div>
      </div>

      {/* Assessment Hint Banner */}
      {hint ? (
        <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs sm:text-sm text-cyan-200/90 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{hint}</span>
        </div>
      ) : null}
    </div>
  );
}
