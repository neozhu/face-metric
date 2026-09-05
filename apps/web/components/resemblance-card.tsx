"use client";

import { useState } from "react";
import { HeartHandshake, Eye, Dna, ChevronDown, ChevronUp } from "lucide-react";

interface ResemblanceCardProps {
  similarity: number;
  level?: string;
  tags?: string[];
  verdict?: string;
  distance?: number;
  model?: string;
  confidence?: number;
}

export function ResemblanceCard({
  similarity,
  level,
  tags,
  verdict,
  distance,
  model,
  confidence
}: ResemblanceCardProps) {
  const [showTech, setShowTech] = useState(false);

  // Fallback defaults if not provided by backend
  const displayLevel =
    level ||
    (similarity >= 0.72
      ? "Strong Family Likeness"
      : similarity >= 0.55
      ? "Noticeable Resemblance"
      : similarity >= 0.38
      ? "Subtle Likeness · Unique Charm"
      : "Distinct Profiles · Unique Looks");

  const displayTags =
    tags && tags.length > 0
      ? tags
      : similarity >= 0.72
      ? ["Expressive Eyes", "Harmonious Contours", "Family Traits"]
      : similarity >= 0.55
      ? ["Shared Expressions", "Similar Jawline", "Familiar Charm"]
      : ["Distinct Features", "Partial Symmetry", "Individual Styles"];

  const displayVerdict =
    verdict ||
    "The two faces exhibit noticeable similarities in eye contours, smile expression, or facial structure, conveying an endearing sense of familial familiarity.";

  // Qualitative dimension highlights based on score
  const eyeDimension =
    similarity >= 0.85
      ? "Exceptional Resonance"
      : similarity >= 0.65
      ? "Very Similar"
      : similarity >= 0.45
      ? "Subtly Resonant"
      : "Distinct Style";

  const contourDimension =
    similarity >= 0.85
      ? "Near Twin Contours"
      : similarity >= 0.65
      ? "Shared Architecture"
      : similarity >= 0.45
      ? "Partial Alignment"
      : "Unique Framework";

  return (
    <div className="w-full space-y-4">
      {/* Warm AI Resemblance Summary Banner */}
      <div className="rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950/80 border border-cyan-500/25 p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          {/* Level Header & Tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/15 pb-3">
            <div className="inline-flex items-center gap-2">
              <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
                <HeartHandshake className="h-4 w-4" />
              </span>
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                {displayLevel}
              </span>
            </div>

            {/* Feature Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {displayTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-950/70 text-cyan-300 border border-cyan-500/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* AI Narrative Remark */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-0.5">
            {displayVerdict}
          </p>
        </div>
      </div>

      {/* Friendly Dimension Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/50 border border-border/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-teal-950/60 border border-teal-500/20 flex items-center justify-center shrink-0 text-teal-400">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Eyes & Expression</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-100">{eyeDimension}</div>
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/50 border border-border/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-950/60 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
            <Dna className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Contour & Bone Harmony</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-100">{contourDimension}</div>
          </div>
        </div>
      </div>

      {/* Low-profile Collapsible Technical Drawer for Geeks/Auditing */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowTech(!showTech)}
          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-400 transition-colors"
        >
          <span>View Technical Parameters</span>
          {showTech ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {showTech ? (
          <div className="mt-2.5 grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-border/60 text-[11px] font-mono text-slate-400">
            <div>
              <span className="text-slate-500 block text-[10px]">Cosine Distance</span>
              <span className="text-slate-200">{distance !== undefined ? distance.toFixed(3) : "--"}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Inference Models</span>
              <span className="text-slate-200 truncate block" title={model}>
                {model || "ArcFace"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Confidence</span>
              <span className="text-slate-200">
                {confidence !== undefined ? `${(confidence * 100).toFixed(0)}%` : "--"}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
